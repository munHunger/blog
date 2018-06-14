This is something that is going to be super obvious for some people, but it is also something I wish I knew about 1 year ago.

So for some background I was working on a medium sized backend system which experienced alot of problems and incredibly slow response times. And no one could really figure out why, besides the classic

> The structure of the code is just bad and there is nothing we can do except rip everything out or pray to code-jesus that it automagically solves itself

Don't get me wrong, the code wasn't propperly structured, and I was probably the first one who said that quote(repeatedly). And it wasn't just me. It seemed that this was general consensus. But after digging around and profiling the application I found out that we spent a lot of time creating new http clients. Sort of like this

[code]/assets/data/posts/resourcePool/Bad.java[code]

This will work, but it sure won't scale propperly, which was something I had to learn the hard way. The solution was ofcourse quite obvious: just use a resource pool so that we don't have to create new clients all the time

There are probably good implementations of resource pools out there, but it is more fun to write your own. And I wanted mine to shrink and grow dynamically. It shouldn't have an upper limit to the amout of clients it holds, but I want it to delete those it doesn't need. And I don't want it to initialize all client objects at start. So this is what I came up with

[code]/assets/data/posts/resourcePool/Pool.java[code]
It is far from perfect, but it is mine, and it did manage to increase our performance of our system by a factor of 10!
I just wish someone had shown me this earlier