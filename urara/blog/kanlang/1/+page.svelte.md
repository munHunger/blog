---
title: 'Breaking the mold'
image: '/blog/kanlang/1/header.jpg'
summary: Conceptualizing a new programing language that breaks how we normally think about development
created: 2023-03-20
tags:
  - 'kanlang'
  - 'compiler'
---

I want to stop writing normal object oriented code. And I think it is about time that we start rethinking things a little bit when it comes to programing. Now, mind you I am not saying that I will cause the next revolution in IT, but with some luck I might help someone get a much better idea than the one I am having.

So, what is this revolution I am talking about?
Aspect-oriented programming!
... I know it is not new, but if you combine it with other paradigms, and drag it to it's extreme it can become a odd language that someone might enjoy. (emphasis on the "might")


## Introducing Kanlang: The Aspect-Oriented Programming Language

If you're a software developer, you've probably heard of aspect-oriented programming (AOP). AOP is a programming paradigm that focuses on modularizing cross-cutting concerns, such as logging, caching, and security, into separate units called "aspects." By separating these concerns from the rest of the code, AOP helps developers write cleaner, more maintainable code.

Here are some of the key features of Kanlang:

## Unique Return Types

In Kanlang, no two functions can have the same return type. This might sound like a limitation at first, but it's hopefully a powerful feature that helps you write more expressive code. With unique return types, you can see at a glance what each function does and what it returns. And if you ever need to change the behavior of a function, you can do so without worrying about breaking other parts of the code.

And I kind of hear you saying that it is going to be an issue, because functions need to be able to return the same object.
And you are somewhat right. With Kanlang I am planning on adding type alias, meaning two objects can be virtually the same, but named differently. An authentication function could take in a `User` object, and return a `AuthenticatedUser` object.

## Dependency Injection at the Core

Dependency injection (DI) is a design pattern that makes code more modular and testable by decoupling the components of a system. In Kanlang, DI is not just a design pattern - it's a core feature of the language. With Kanlang, you can inject variables wherever you need them, even inside code blocks. And because Kanlang uses static typing, the compiler can check that the injected variables are of the correct type.

It can even go as far as to check the method arguments that the providing function requires.
Meaning that inside of a code block you can inject an `AuthenticatedUser` without explicitly calling the function, assuming that you have a `UnathenticatedUser` object somewhere in your scope.

## Conclusion

This is going to be an extremely odd language, that is likely never to see the light of production, but I see it as a interesting thought experiment.

And to give you a taste of what I am envisioning here is a code snippet.

```
type User {
    email: string
    password: string
}

fn authUser(User u) AuthenticatedUser alias User {
    if u.email == 'abc@email.com' && u.password == 'abc123' {
        return u
    }
    throw 'User can't authenticate'
}

fn welcomeUser(User u) UserGreeting alias string {
    *AuthenticatedUser authedUser //Let the star indicate that it is supplied through DI, and it should "resolve" the call to authUser using u
    return "hello " + authedUser.email
}

User myUser = {
    email: 'abc@email.com',
    password: 'abc123'
}

print(*UserGreeting)
```