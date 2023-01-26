---
title: 'Creating a compiler for language learning'
image: '/blog/linitic/1/header.jpg'
created: 2023-01-26
updated: 2023-01-26
tags:
  - 'language learning'
  - 'japanese'
  - 'compiler'
  - 'linitic'
---

I've been trying to learn japanese for quite some time now, and just like everyone else I've used the "normal" apps such as duolingo to get the job done.
And just like every other developer out there using an app, I convinced myself that I can make an app that is better than the immensely popular one I am already using... I am of course wrong in this, but it has been a fun journey.

# Prototypes
I started making a bunch of prototypes with a lot of confidence, and little knowledge of the domain.
I remember one of my early prototypes where I got annoyed that a character could mean more than one thing *and* be pronounced in more than one way... Absolute madness, and obviously _"they"_ made a mistake when creating the japanese language.

Anyways the early websites I made are not really the topic for this post, no matter how polished or unpolished they were. Instead I want to focus on the latest webapp I made.

# Wishlist
I had the idea to create a learning app with vocabulary lessons, grammar lessons, and story driven lessons where you try and have a scripted somewhat realistic chat conversation.
And to top it all up, creating the lessons (or content) to the app had to be easy and not hindered by annoying repetitive formats such as json or yaml. Seems like an easy task right?

# Compiler
So I did what ever other sane language learner with a bit of programming know how would do... I wrote my own compiler for a custom DSL.

Now, don't get me wrong: making a compiler is a massive overkill and can be a daunting task, but I had scoped it to such a level where it really wasn't that big of a task.
But anyways, I started out the way I always do, which can only be described as the wrong way. I started writing code first without doing the slightest bit of research on how compilers generally works, because how hard could it be?

Well turns out it is at least a bit tricky and my first iteration ended up as a pile of spaghetti code that I barely worked and was so rigid that I could forget about adding any features that I wanted.

So I scrapped it, and started doing a little bit of research and stumbled upon [https://www.npmjs.com/package/nearley](nearley) which I believe would be absolutely great for most compiler projects. Unfortunately it wasn't really possible for me to use it because I could for the life of me figure out how to make it tab/space aware, and I wanted my language to have semantically important spaces the same way yaml does.

Back to square one and I decided to make everything myself... but which some background knowledge.
So I made it the way I should have the first time, with a tokenizer and parser which gave me an output in the form of a parse tree.

I could then take that output and compile it into some svelte code, which worked great... unfortunately I completely burned out on the project before it got even remotely useful.

Here is an example of the input to the compiler
```
vocabulary:
  もしもし
  hello
  先[せん]週[しゅう]
  last week
grammar:
  title: い adjective conjugation
  conjugating in affirmative inflections
  present | past
  [い]です | [-い-]かったです
  ex:
    present  | past
    たのしいです | たのしかったです
    おいしいです | {text hiragana | validate おいしかったです}
    おおきいです | {text hiragana | validate おおきかったです}
story:
  > 先[せん]週[しゅう]仕[し]事[ごと]はどうでしたか
    how was last weeks work?
  < 忙[いそが]しかったです
    {text hiragana | validate いそがしかったです}
                   | suffix いです | hint "You are not conjugating to past tense"}
    {help "base for of busy is 忙[いそが]しい. To make any い adjective into past affirmative tense you remove the trailing い and add かった"}
    It was busy
```

oh well, for the next project at least I know how to write a compiler.