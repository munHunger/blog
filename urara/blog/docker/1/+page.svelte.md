---
title: 'Works on my machine'
image: '/blog/docker/1/header.jpg'
summary: Why the promise of docker is a lie, and why it isn't
created: 2023-09-25
tags:
  - 'Docker'
---

Have you been sold the promise that Docker will solve the ancient issue of "works on my machine"?
And have you faced issues with your local environment that uses docker, and questioned, "why isn't it working on my machine?"

It is not unlikely that you have fallen into this trap and wondered why docker is being sold that way, and I am hoping to shed some light on the issue with this post.

# Production

OK, lets begin with the place that is the most important, Prod!

In the times before Docker, we threw a bundled package over the wall to the ops team and they moved the package over to a prod server and hit the restart button.
For the majority of deployments this worked without issues. _But_ it wasn't perfect. What happened when for instance you upgraded java version?

Let us assume that you had a legacy system that you upgraded from java 8 to java 11. On your local development environment you installed java 11, and made sure everything was working, then you once again threw the bundle to the ops team, and then it got tricky for them. Of course they too needed to install java 11, and they probably needed to change some service definitions to use java 11 instead of 8. So far so good, it _should_ work, even though it was a bit of a hassle. But then it breaks! And you start questioning why it breaks. The same code works on your machine, how come it doesn't in prod? Turns out you installed oracle JDK11 on your machine, and you only specified java 11 to the ops team, who went ahead and installed GraalVM, and now production is broken.

This hypothetical might not be the biggest of issues, and it can be mitigated in more than one way. But the fact that the underlying systems aren't working the same way is a massive issue. Another pretty clear example would be if the prod servers are running linux and you are running mac. They are both unix systems so you have access to a lot of similar tools. And you might think that both have access to the `sed` command since it is in the path on both machines... _but_ of course they don't work the same, unless you had installed `gsed` on mac. Small things like that are why we need docker.

# Local dev

Ok, so you have dockerized your production environment, great!
And you made a deployment that for whatever reason is not behaving like you expected. So you start debugging it, by checking out the same git commit as prod is running and you run something like `docker built -t app . && docker run -it app` (build and start the docker image).
Some progress bars start flying across the screen and then you get an error message and the build halts.
Weird, right? it runs in production so this should work. You ask your desk neighbor to do the same and he says "works on my machine".
At this point you start blaming docker, and question what the point is, since it doesn't solve the core issue!

But here is the thing: The works on my machine issue can show itself in two places. When running and when building.
If you would have skipped the build step and instead just ran `docker run -it app:prod` it is likely to have worked.
Or at the very least it would behave the same as the prod version, but it could of course still crash because of networking issues, access problems, or just plainly wrong environment variables.

So why was it working for your desk neighbor and not for you?
There could be tons of reasons for this, but for instance you can have different docker layers in your caches. Or, you could have different files on disk.
For example your project could have important but (to git) ignored files, and when you are adding files to your docker layer you can get a diff.

# Conclusion

So does docker solve the "works on my machine" problem?

Without a question it does solve that problem in some aspects. It just doesn't solve it in all places you might wish it does.
Docker is in no way a magic bullet, but you can be sure that if you test an image in a test environment and send **the same** image to production you can be sure that the code will behave the same way and any issues are likely to be related to configuration or other supporting systems.
Key point here is to use the **same image**. If you are rebuilding a new image for production it will in essence run untested code.
