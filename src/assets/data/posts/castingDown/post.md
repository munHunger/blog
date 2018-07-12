I have repeatedly ran into the problem where I have an Object that needs to be converted from some other Object, only to realize that there already is a method to populate the super Object and I am unable to cast down.

Imagine that you have the following structure:

[code]/assets/data/posts/castingDown/Structure.java[code]

Which seems rather natural where you have a very small object, `Bare` designed for a list where you send lots of them.
On top of that you have a more detailed object, `Middle` which might take longer to load but still contains some usefull information when seding just one of these.
And lastly you could have a `Full` object that you perhaps need special priviledges to view.

I have seen this sort of structure alot and code to populate it like this

[code]/assets/data/posts/castingDown/PopulateNaive.java[code]

And it bothers me alot when I see code like this, because not only is it big and ugly, but it is extremely errorprone. And you cannot go the "easy" way out by casting down, because writing `(Full)getMiddle()` will throw an Exception.

One solution to this(don't judge me for doing this, I didn't know better) is creating a method that casts a `Middle` object into a `Full` object, but this causes even more repetition if you don't use reflection to loop over the fields. Although using reflection can be quite error prone as well.

But the solution can ofcourse be quite simple, if you just tell the method what Object to create.

[code]/assets/data/posts/castingDown/Populate.java[code]

Not only is this less code, but there is less code repetition and easier to build on to. And the exceptions can either be thrown or caught if so desired, but they represent a code structure issue such as a missing empty constructor and not something that can be thrown sproadically at runtime.