---
title: Fever dreams
image: '/blog/kanlang/4/header.jpg'
summary: Slacklining the line between genius and insanity
created: 2023-09-14
tags:
  - 'kanlang'
  - 'language design'
  - 'compiler'
---

I feel like I just woke up from a fever dream. The language I have been working on the past month or so is now in a state where you theoretically could use it to write code and solve problems.
And for the first time since starting this project I am really looking at what I've done.
I sort of wish that I could write how it became a good language that I hope someone would want to use, but in reality that was never the intention. It didn't turn out to be a good language, but I am surprise that it is not _just_ a steaming pile of shit.

## Kanlang

So for those that haven't followed this blog, I am talking about my programming language [Kanlang](https://kanlang.wunderdev.com).
It is a language where function names and direct function invocations plain and simple aren't part of the language.
I don't what to repeat myself to much so either check out the language [here](https://kanlang.wunderdev.com) or read more in my [previous posts](https://blog.wunderdev.com/?tags=kanlang)

## Takeaways

OK, so what have I learnt from this journey?

I learnt that you should implement your own parser. I started out using [nearley](https://nearley.js.org/) and while it is a great tool, it fell a bit short when the complexity grew. After replacing it with my own implementation of [earley parser](https://en.wikipedia.org/wiki/Earley_parser) everything started flowing so much smoother. And in the end I got a much better understanding of how a parser works. Worth noting that if you are creating a "real language" unlike the POC that I created, you might want to consider something other than earley as it isn't the fastest algorithm out there (but it handles grammar ambiguity and both left and right recursion).

Going slow is going fast. More than once did I take what looked like minor shortcuts to solve the immediate problem I was facing. It made the project move forwards and I was pretty happy with that, but more often than not did it explode in my face later on, and it because a mess of tangled code. I think it would have been a lot faster to simply take a breath and take my time with each and every problem, no matter how small.

However my most important takeaway is that I am apparently really into this stuff. Writing this compiler has been a ton of fun and now all of a sudden I've added a hammer to my toolbelt and everything is starting to look an awful lot like a nail.
