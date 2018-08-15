Usually when I am about the write testcases I think quite hard if I should make unit tests or integration tests.
Something in me is always yelling that I should write unit tests because they are fast, repeatable and in someway pure.
However writing unit tests for simple APIs seems rather odd as it is so dependant on what is being returned from the database. You would of course be certain that the potential conversion between a database entity object and a data transfer object is working, and that any precondition checks are working as they should.
But the promise of testing a "real" scenario without mocks with integration tests are usually what pulls me away from writing unit tests.

It is usually the case though that unit tests are faster to write as you don't have to setup as much as you do with integration tests, and you don't have to spend a lot of time verifying that the system is ready to be tested, since everything is mocked. Recently though I made a docker container that would solve my issues with bad data in an integration/end-to-end test.

[code]/assets/data/posts/dockerTesting/tester[code]

The `Dockerfile` for the test runner is quite simple and adds just what is needed to build the backend, which in my case is maven.
It then runs a rather interesting shell script, that first of course builds the backend system to be tested without testing it right away.

[code]/assets/data/posts/dockerTesting/build.sh[code]

Then it comes to a rather hacky part, where it finds all testsuites in a package and loops over them.
I decided to run each suit separate since I wanted them to be isolated from each other and not carry over any garbage data between them.

[code]/assets/data/posts/dockerTesting/loop.sh[code]

So here comes the interesting part. For each suite I rebuild the postgres database. This is using a custom image the completely wipes the database before start and then creates the necessary credentials and whatnot required for the backend. It then rebuilds and starts the backend API and links it to the database. 
All of this in a newly created docker network, because I don't want it interfering with any other container.
So after building the database and the API I link the tester container, i.e. the container creating the database and the backend to the new test network with a link to the API.

[code]/assets/data/posts/dockerTesting/setup.sh[code]

Once that system is up, the testing container can run through all the tests and save the response. The exit code of running the maven tests does of course reflect the result of the tests.

Afterwards the script cleans up as expected and moves on the next test suit

[code]/assets/data/posts/dockerTesting/test.sh[code]

Here is the code in its entirety

[code]/assets/data/posts/dockerTesting/full.sh[code]

Since this approach relies heavily on Docker in Docker you need to set that up.
I do it like this in a docker-compose script

[code]/assets/data/posts/dockerTesting/compose[code]

So all in all, this approach adds a couple of seconds(or minutes) to the test time, but it is well worth it for giving highly repeatable API tests.