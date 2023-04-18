---
title: Rigid and unique
image: '/blog/kanlang/2/header.jpg'
summary: A broken language with weird type systems that you will love to hate
created: 2023-04-18
tags:
  - 'kanlang'
  - 'compiler'
flags:
  - unlisted
---

Have you spent sleepless nights endlessly searching for the next big thing in programming languages?
Perhaps a language that is barely working? Or some that, if it did work, was quirky enough to deter anyone developer in their right mind?

Well look no further for I have just the thing for you!

# Kanlang

A while back I wrote a [post](/blog/kanlang/1/) about a conceptual language that I wanted to create, and today I have reached a milestone!
The language is barely working, but it is almost a proof of concept.

So what is it all about?

Kanlang is/will be a Object oriented language with a rigid typesystem, where no two functions can have the same return type.

That is the core point of Kanlang, and from that one can create some pretty weird systems. For example, if I create a variable of type `A` any transformation of that variable to, for instance type `B` can be done implicity without calling any functions.

Let me give you an example:
```js
fn celsiusToFahrenheit(celsius Celsius alias num) Fahrenheit alias num {
    num fahrenheit = celsius * 9 / 5 + 32
    return fahrenheit
}
Celsius c = 100
Fahrenheit f
```

We have a `Celsius` type in our scope and we have a function that converts from `Celsius` to `Fahrenheit`, so we don't need to explicitly call said function. It is enough for us to declare that we want `Fahrenheit` and the language will use whatever we have in our scope to make that happen.

Note that there shouldn't be anything stopping you from directly calling the `celsiusToFahrenheit` function directly if you want... except that it is not yet implemented

# Proof of concept

So Kanlang is not really done.
I think calling it a proof of concept is overselling it a bit as well.
Maybe we can go for a pre-proof of concept?

I think that the idea of this language is kind of fun and interesting. 
And there is a saying that constraints are good for innovation and creativity, so I have a hope that the constraints of Kanlang will lead to something.
Of course that something will not be production, but maybe another language somewhere down the lines.

# Current and future

Currently there are tons of things not implemented.
To name a few:
* Its' typesystem is not that rigid yet
* It only really supports numbers
* It doesn't support direct function calls

But it is available in an [online editor](https://kanlang.wunderdev.com/).
It doesn't run anything but it shows the javascript that it is compiled down to.

## Advent of code

I have so far had a lot of fun creating this language, so I will not stop here.
My plan is to continue to develop it into something that actually works.
And to make things a bit more fun for me I will start doing [advent of code](https://adventofcode.com/) challenges with the language, and fix whatever feature I need in order to pass each challenge.

I am guessing it is going to take me more than a month to do that though, so wish me luck!

Oh, and if you want to have a look at the internals of it, then check out the [github repo](https://github.com/munHunger/kanlang)