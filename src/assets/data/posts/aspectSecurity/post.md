Pretty much everyone you talk to who knows anything about reflection in java will agree that it is an extremely powerful tool, but that it is dangerous to use as it can cause some unexpected side effects. Which of course makes sense as you can for example easily change the access modifier of a field.
I personally really like using reflection, partially because it is so powerful and it really opens up what you can do with the language. Another reason for why I like reflection is that it gives me the feeling of "breaking" the language to do something it shouldn't, which is really fun. That is the main reason why I am so interested in Aspect oriented programming. 

I won't go into details about what Aspect orient programming is as there are a lot of other blog posts that explains it better that I can.
But in short you can use it to inject code `before`, `after` and `around` your methods. The most common and obvious example for when it is used is logging, since you can log all method calls and how long they took without writing a lot of code. It can also be used to check some preconditions of models, but I am not sure that I like the structure of that.

This post was written mainly for me to learn AspectJ and I was curious if you could create a simple security aspect that throws an exception if you try to access something that you aren't allowed to. So, getting started you need to create a `pom.xml` file, which is quite straight forward

[code]/assets/data/posts/aspectSecurity/pom.xml[code]

From here I decided to create a simple model of a `User` that I can use to test against where some fields should be open for everyone and some fields would require certain authentication to access. *I omitted the getters and setters for simplicity*

[code]/assets/data/posts/aspectSecurity/User.java[code]

Note the annotation used to set authentication level per field.

[code]/assets/data/posts/aspectSecurity/Secured.java[code]

And now comes the fun part. The aspect code. So I created a `SecurityAspect.aj` file

[code]/assets/data/posts/aspectSecurity/SecurityAspect.aj[code]

The `@Before("execution(* *get*(..))")` makes it so that the code is executed before any method following the regex `get*` is executed.
I haven't really gotten my head around the regex filter, so the problem is that this code will also match all methods named `get()`, which is a problem.
That is why I had to add the filter for methods named only get.

[code]/assets/data/posts/aspectSecurity/GetFilter.java[code]

I then fetch the name of the field. Should be noted that this assumes a naming convention where `get` is prepended to the fieldname.

[code]/assets/data/posts/aspectSecurity/FieldGetter.java[code]

The actual authentication doesn't seem that relevant for me, so I made a simple way of "storing" the authentication with the thread in a `ThreadLocal`

[code]/assets/data/posts/aspectSecurity/ThreadAuthentication.java[code]

This will make it so that the `SecurityLevel` object will follow the lifespan of the thread. Of course the result of this is that you will lose authentication if you spawn a new thread, but you could possibly solve this by passing the authentication down to the new thread using an `Around` aspect. But I'll leave that as an exercise for the reader.

Last thing to note here is that I am throwing an `AccessDeniedException` which extends `RuntimeException`. And this is important because it cannot be a checked exception unless the called method is also throwing the same checked exception. Therefore it is much safer to only throw unchecked exceptions.

I also feel like sharing my testcases.

[code]/assets/data/posts/aspectSecurity/Test.java[code]

So with all of this, I hope that you will get an insight of the power of aspectJ and how it is pretty much black magic that breaks everything, while still being super cool!