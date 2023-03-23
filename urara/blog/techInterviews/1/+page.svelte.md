---
title: 'Why your tech interviews are failing'
image: '/blog/techInterviews/1/header.jpg'
summary: An outline of why the most common tech interview structures are bad, and what could be done instead
created: 2023-03-23
updated: 2023-03-23
tags:
  - 'Interviews'
---

# Why your tech interviews are failing

The title may seem harsh, but I feel strongly that most tech interviews I've had and held have been pretty shaky. Let me start by listing some common interview types I think are quite bad, before giving away the golden answer for how to hold a tech interview.

## Code assignment
This type involves giving the applicant an assignment to develop and submit before the interview to ensure they know how to write code. However, it doesn't give the interviewer much input. Without knowing the conditions the code was written under, how long it took, and how much help the applicant received, it becomes challenging to gauge their skills. 

It should be a starting point for discussions, but it could also be overwhelming depending on the task. 

Some people may even turn down offers that require homework, not because they don't know how to code, but because of the principle of it.

## Let's just talk about it


This approach is wayy to common. You sit down for an hour with a manager, a developer, and the applicant and talk loosely about what they have worked with.
And after the hour is up you go with gut and approve or reject them soley because of their confidence, which it usually boils down to.

The issue with this approach is that it is really hard to gauge what the applicant knows. And I think it is really easy to pass these interviews if you just "sound confident". On the other side of it, it is really hard as an interviewer to get a feel for how much they actually know.

## Create a quicksort algorithm

I've never been on either side of this type of interview, where you get a code problem to solve live in front of the interviewers.
Which is unfortunate, because I would like to try it. That said I can kind of see a flaw in this approach which is that day-to-day work is just so disconnected for these types of tasks.

My job is basically just pushing data around... with some bells and whistles.
I am not doing anything remotely complex enough for me to have to be that strong in algorithmic design. I hope that I am anyways, but as said, I've never gotten this type of interview.

# How to interview the right way

In my opinion, the most valuable assignment to evaluate someone's skills is to have them review a piece of code. It doesn't take more than 30 minutes, and it gives you a pretty good insight into whether they know what they are talking about or not.

So here is how you do it. You create a piece of code in the "target language" that is roughly 50 lines of code. This could be a class, a UI component, a PHP file, or whatever seems reasonable. 
Then, start adding errors. Add easy syntax errors, such as not referring to `this` where needed, or null checking before assignments(when you know it to be null). 
Add some bad practices, like not doing anything in a `catch` statement. Add some bigger structural issues, such as _"should this UI component really be in charge of HTTP requests, or shouldn't that go through a service layer?"_.

Hand them this piece of code, and tell them that it is full of errors.
Tell them to treat it as a pull request, and ask if they would be happy if it got released to production.
Ask them if they would do something differently.
Give them ten minutes to think, where you leave the room and grab a coffee.

When you come back they can give you their findings, and you can discuss what they found. In my experience it is rare for anyone to find all the errors, so you should guide them a bit. For example _"what would happen here on line `x` if `y`?"_. Either they get it at that point or they are completely lost. It becomes a great indicator of whether they know what they are talking about, as you clearly know that a senior developer should have spotted the error straight away, or as a junior dev they should spot it if they are guided a bit towards it.

I've turned down quite a lot of developers that sounded really confident, but could not do an easy code review. There is, of course, the counterargument that they might just be nervous or stressed, but I think that if you can't handle that, I wouldn't trust you to help out when there is a fire in production.

# Conclusion

In conclusion, conducting a code review as part of your interview process can be a valuable tool for evaluating a candidate's skills and determining if they are the right fit for the job. It allows you to gauge their problem-solving abilities, attention to detail, and understanding of best practices. By following the steps outlined in this post, you can improve your chances of hiring the right developer for your team.