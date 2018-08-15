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