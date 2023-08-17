---
title: Keyboard slavery
image: '/blog/kanlang/3/header.jpg'
summary: Modern typescript forces us into slavery under the rule of compilers and linters
created: 2023-08-17
tags:
  - 'kanlang'
  - 'language design'
---

Variable assignment syntax seem to differ quite a bit when looking at different programming languages.

For example in pascal it is pretty succinct with the assignment operator `:=` and the reassignment operator `=`.
```pascal
a :=3
a = 2
```

In older versions of java you had to write out your type in front of the variable name to create it.
```java
int foo = 3
```

I don't think this makes much sense, as the right hand side is of course already a type, so the type of foo can be inferred from the right side of the operator. More than that it is of course also enforced, so this is not semantically valid.
```java
int foo = "bar"
```

The modern java developer will be quick to point out that this is a thing of the past as the `var` keyword was introduced in java 10
```java
var foo = "bar"
```

Which allows the type of foo to resolve to the type of the right hand side of the assignment.
I think this is great, but my experience is that it hasn't been met with the reception it deserves, and instead the adoption has been somewhat hesitant.

# On to javascript
JS is a beast when it comes to this.
It has no less than 3 assignment keywords, `var`, `let`, and `const`.

`let` and `const` are similar to each other. The only difference is that `const`, like you could guess is a constant and thus can't be reassigned. Note here that it does not mean it is immutable, i.e. this is valid.
```js
const a = {foo: "bar"}
a.foo = "hello"
```

On a slight side note this can be done in java as well with the keyword `final`
```java
final int foo = 3
```
And in fact this `final` is inferred by the compiler if you don't change the value and don't add `final`

`var` is a bit of a game changer in the fact that it escapes the current scope.
For instance this piece of code
```js
try {
  var foo = "bar"
} catch (e) {}
console.log(foo)
```

Is fully valid and prints `bar`. You can imagine it becomes more interesting if the right hand side could throw errors.
If you aren't using `var` it would look like this
```js
let foo;
try {
	foo = "bar"
} catch(e) {}
console.log(foo)
```
To me I would prefer the `var` code example.
But here is where it becomes an issue.

Standard lint rules for javascript (and typescript) blocks all usage of `var`, which is crippling the language.

On top of that the standard rules tell you that you *have* to use `const` if you variable is not changing, something that is inferred by the typescript/javascript compiler/runtime.

## where am I getting with this

OK, so there are different ways of assigning variables, what is my point?
The point I am trying to make is that variable assignments in programming should be the same no matter how it is used, or the diff should provide some additional layer of control.

```java
final int a = 3
```
the `final` part adds a layer of control meaning it shouldn't be changed. But nothing is forcing it to be there.

The `int` part however is not providing control and it is just keyboard slavery. I, as a developer **have** to write `int` (prior to java 10).

In typescript/javascript the compiler isn't forcing me to do anything but the lint rules that are everywhere and considered best practice will make me a slave under its' rules.
I have to write either `let` or `const` and I have no choice in which one I pick, it is predetermined by the linter.

## My own design
In the language i am writing (`kanlang`) I will use the same type as pascal, i.e. `:=` for the simple reason that it is short and to the point. The type is inferred from the right hand side, and there is no keyboard slavery.
For solving the "issue" with having constant variables, I am considering something along the lines of `!:=` to indicate that we are assigning and we are not allowed to change it

## Conclusion

Us developers should be free to make our own decisions of the code, and the compiler should feel free to add optimisations such as implicit `final` where it doesn't change any functionality but improves the performance.