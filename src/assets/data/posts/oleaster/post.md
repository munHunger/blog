Most people like software that is unittested and a large codebase with 100% code cover is like a wet dream for developers. Or at least I hope it is and I am not the only one who really love it. The problem is however that few projects are well tested, especially in terms of unittests.

From my perspective I used to hate writing unittests and thus I never experienced the benefits of a tested codebase. I hated writing test cases because it felt so cluncy writing jUnit like tests where you get a lot of code repetition since a lot of tests need the same setup code. Now, I get what you are saying, that I should just be a good programmer and structure my code in a way to avoid code repetitions. But the problem is that restructuring jUnit testcases to avoid code repetition takes a lot of time and can be quite difficult as the structure easily grows to a lot of different files and packages.

The solution I found to my problems was simply throwing out the syntax of *classic* testing and replaced it with Oleaster, which employs a jasmin like test syntax. Test cases written with oleaster is written in a tree structure where you *describe* your current scenario, and then write some code to setup the envirornment/code to look like it. You then write some tests to make sure that the scenario is as expected and that it is performing as expected, for example you can write something like this

[code]/assets/data/posts/oleaster/Simple.java[code]

That is a super basic example, but it shows that the test is not that far from being plain english. And as you can see it relies heavily on lambda expressions. As I previously stated you can combine multiple tests into a tree like this

[code]/assets/data/posts/oleaster/Tree.java[code]

You can continue doing this infinitely to create really large tests. In the example shown it will create the file twice, once for each test. You can change it to use `before` instead of `beforeEach` if this is not desired, and you can also use `afterEach` to cleanup if needed.

So how do you go about using oleaster? I would highly recomend using powermock with any testing so I will show you how to use oleaster with powermock. First of you will need to add your dependencies

[code]/assets/data/posts/oleaster/build.gradle[code]

Note that junit is still required as it is still using it in the background

So now that it is included you will need to tell junit to use PowerMockRunner, and then tell PowerMockRunner to use Oleaster... it is easier than it sounds. You simply need to add some annotations

[code]/assets/data/posts/oleaster/Full.java[code]

And that is pretty much it. That is the basics of oleaster that hade me fall in love with unit testing. It combines with normal testing as powermock and junit expressions still work, but on top of it, it has restructured the way you write the testcases in a way that is easier to structure.