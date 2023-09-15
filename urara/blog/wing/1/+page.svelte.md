---
title: Blurring the lines between IaC and C with wing
image: '/blog/wing/1/header.jpg'
summary: Winglang removes the current idea of separating infrastructure as code and normal code. And it solves the current pain points of cloud development by running everything locally.
created: 2023-09-15
tags:
  - 'wing'
  - 'language design'
---

Do you remember the last time you saw some piece of tech that made you go "Wow! Why haven't we seen more of this already?".

Besides the topic of this blog post, the last time for me was [svelte](https://svelte.dev/). It made me think "why are we shipping massive frameworks to browser". For those who don't know svelte is a compiler that takes your frontend code and bundles it into a page. And the code you write feels like it is written in a normal framework, but instead of shipping hundreds of kB or mB of just framework code, Svelte bundles into a small package with only the code needed to run your website.

This post isn't about svelte though, it is about the latest piece of tech that blew my mind away.
Namely [wing](https://www.winglang.io/).

## Wing

So what is it about wing that made me go "Wow!"?

Wing is the first language I've seen that covers the full stack and is truly cloud native.
What I mean by that is that the code you write can be compiled into a terraform script that deploys your app to AWS (or other clouds). This sounds like such a minor thing, because writing terraform scripts isn't that painful and separating infrastructure as code from normal code doesn't sound that bad. But what wing does, which I find amazing is that it removes the concept of IaC being different from just code.

### Hello World

It might be easiest if I show a basic example of how it works.

```
bring cloud;

let counter = new cloud.Counter();
let api = new cloud.Api();
api.get("/hello", inflight (): cloud.ApiResponse => {
    counter.inc();
    return cloud.ApiResponse {
        status: 200,
        body: "world ${counter.peek()}"
    };
});
```

This hello world example will create an api gateway with a lambda that responds to `/hello`.
For each request it will update a counter stored in dynamoDB and respond with `world x`, where x is the current value of the counter.

This example in itself should be enough to convince you that wing is a pretty cool piece of tech to consider.
But lets take it a few steps further!

By running this command

```bash
wing it main.w
```

you start a local simulation of your code (think [localstack](https://localstack.cloud/), but slimmer).
And you get a pretty nice UI that shows you how everything is connected, and you can click around to see your state, and execute parts of your code.
![hello world](/blog/wing/1/hello_world.png)

Running things locally is in my opinion one of the biggest downsides of going cloud... or rather, the fact that it is difficult to do so.
At my previous employments I've used localstack quite a lot, because without it I have no idea how my code will react before I release it. And hopefully I haven't released it to prod yet.

So being able to click around like this is a huge win in my books!

But why stop with being able to simulate your local cloud?
Let us add a test and you will see how powerful this simulation is

```
bring cloud;
bring http;

let counter = new cloud.Counter();

let api = new cloud.Api();
api.get("/hello", inflight (): cloud.ApiResponse => {
    counter.inc();
    return cloud.ApiResponse {
        status: 200,
        body: "world ${counter.peek()}"
    };
});

test "counter increments per request" {
    assert(http.get(api.url + "/hello").body == "world 1");
    assert(http.get(api.url + "/hello").body == "world 2");
    assert(http.get(api.url + "/hello").body == "world 3");
}
```

![test](/blog/wing/1/test.png)

Pretty simple, right?
And this tests that if you send an HTTP request to `/hello` a lambda function will run and update dynamodb with each request.
That is not something I would consider easy to test normally, unless you first deploy it to aws or localstack and then run an integration test against that.

I am also a massive fan of having the test code in the same file as the real code. It elevates them to first class citizens, which they rightfully are.

### Adding complexity

Let us assume that doing updates to the counter is pretty slow, and we want to do that asynchronously.

```
bring cloud;

let counter = new cloud.Counter();
let queue = new cloud.Queue();
let api = new cloud.Api();

queue.setConsumer(inflight () => {
    counter.inc();
});

api.get("/hello", inflight (): cloud.ApiResponse => {
    queue.push();
    return cloud.ApiResponse {
        status: 200,
        body: "world ${counter.peek()}"
    };
});
```

![queue](/blog/wing/1/queue.png)
Can you imagine doing this with javascript and terraform?
It is pretty insane how much power you are getting out of so little code.

### Inflight vs preflight

Wing manages to be this cool by utilizing what they call `inflight` and `preflight` code.
You might have notices the `inflight` tag in the examples above. It indicates that the code should be deployed and run in the cloud. Everything else is only run during setup.
But the fact that you can access preflight resources from an inflight context makes the code feel pretty seamless and you don't realize that you are writing IaC.

## Downsides

No language is perfect.
Winglang is no exception to that rule. It is very much still in beta, and it shows. It feels like it has a lot and what it has shows a lot of potential, but it does not feel like a language that is mature enough to be in production yet.

One example for that is this:
at time of writing they support noSQL like dynamoDB via the _"external libraries"_. Great! I didn't expect seeing a relational database this early in development. But this library is really limited. You can do insert, delete, and get just like expected, but if you don't know the key, you are stuck with a full scan as the `.list()` method takes no argument you are getting the entire table dumped.

I should be clear and say that this might be something that could be solved at any time as the language is undergoing some pretty heavy development.

## Conclusion

I for one am hoping that they continue with the winglang project, as it shows so much potential. And I will be keeping my eyes open in hopes of seeing the first 1.0 version.
