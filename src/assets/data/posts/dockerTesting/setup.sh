    docker network create --driver bridge --attachable --label testNet testNet
    docker build -t test/postgres /opt/postgres
    PG=$(docker run --rm -d -e "POSTGRES_PASSWORD=postgres" -e "PGPASSWORD=postgres" --network-alias postgres --net testNet test/postgres)

    docker build -t test/backend /tmp/backend
    SRV=$(docker run --rm -d -e "DB_URL=postgresql://postgres:5432/db" -e "DB_USER=postgres" -e "DB_PASS=postgres" --link postgres:postgres --network-alias backend --net testNet test/backend)
    docker network connect --link backend:backend testNet $HOSTNAME