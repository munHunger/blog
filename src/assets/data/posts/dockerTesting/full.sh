#!/bin/sh
echo "Building backend"
rm -rf /tmp/backend
mkdir /tmp/backend
cp -r /opt/backend/* /tmp/backend
cd /tmp/backend
mvn -Dmaven.test.skip=true clean install payara-micro:bundle

for TEST_FILE in $(ls /tmp/backend/src/test/java/se/test)
do
    docker network create --driver bridge --attachable --label testNet testNet
    docker build -t test/postgres /opt/postgres
    PG=$(docker run --rm -d -e "POSTGRES_PASSWORD=postgres" -e "PGPASSWORD=postgres" --network-alias postgres --net testNet test/postgres)

    docker build -t test/backend /tmp/backend
    SRV=$(docker run --rm -d -e "DB_URL=postgresql://postgres:5432/db" -e "DB_USER=postgres" -e "DB_PASS=postgres" --link postgres:postgres --network-alias backend --net testNet test/backend)
    docker network connect --link backend:backend testNet $HOSTNAME
    
    echo "Waiting for backend to come online"
    for i in 1 2 3 4 5 6 7 8 9 10
    do
        status_code=$(curl --write-out %{http_code} --silent --output /dev/null http://backend:8080/api-1.0-SNAPSHOT/swagger)
        if [[ "$status_code" -ne 301 ]] ; then #301 redirect for some reason
            echo "Backend not yet up:$status_code";
            sleep 5;
        else
            echo "Backend is up";
            break;
        fi
        if [ $i -eq 10 ]; then
            docker logs $SRV
        fi
    done


    TEST=$(echo $TEST_FILE | cut -f 1 -d '.')
    echo "running test "$TEST
    mvn -Dtest=$TEST test
    RESULT=$?

    docker stop $PG
    docker stop $SRV
    docker image rm --force test/postgres
    docker image rm --force test/backend
    docker network disconnect testNet $HOSTNAME
    docker network rm testNet
    if [ $RESULT -ne 0 ]; then
        exit $RESULT
    fi
done
exit 0