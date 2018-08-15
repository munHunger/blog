rm -rf /tmp/backend
mkdir /tmp/backend
cp -r /opt/backend/* /tmp/backend
cd /tmp/backend
mvn -Dmaven.test.skip=true clean install payara-micro:bundle