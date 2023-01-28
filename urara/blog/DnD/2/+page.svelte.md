---
title: 'Dice parser'
image: '/blog/DnD/2/header.jpg'
created: 2023-01-28
updated: 2023-01-28
tags:
  - 'DnD'
  - 'javascript'
  - 'typescript'
  - 'nearley'
  - 'compiler'
---

I got the urge to write a parser for table top gaming.
For example `4d6+1` meaning roll 4 6 sided dices, sum it all up and add 1 to the result.
A pretty simple task, that could probably be done by just looking at the string and doing some splits or substrings. But I want to do it with [nearley](https://www.npmjs.com/package/nearley), because that sound like fun to me.

# Basics
Lets begin with the most basic example of `4d6`. It has 3 components, a number followed by a letter `d` followed by another number. So lets create a parser for it with nearley

```
# this is our starting rule
Main -> int "d" int

# We are only interested in integers. floats does not make sense here
int -> [0-9]:+        {% (d) => parseInt(d.flat().join("")) %}
```

Note that the `int` rule produces an array of strings, so with the postprocessing function we can make sure that it outputs an integer.

So, parsing `4d6` will output `[4, 'd', 6]`.

Next up, lets add a parser for the optional `+1` at the end

```
Main -> int "d" int
Main -> int "d" int "+" int
```

And we are pretty much done. But I think we can do better, by adding a few features.
To begin with it would be good if we could use more than one type of dice. For instance 2 6 sided dices and 1 10 sided dice `2d6 1d10`.

# Multiple dice and recursion
To do this we can begin by refactoring the main rule into a dice rule

```
Main -> Dice

Dice -> int "d" int         {% (d) => ({count: d[0], sides: d[2], bonus: 0}) %}
      | int "d" int "+" int {% (d) => ({count: d[0], sides: d[2], bonus: d[4]}) %}
```

Note that we are also formatting the output into an object to make it less error prone.
Now to add multiple dices it is as easy as adding right hand recursion on the `Main` rule.

```
Main -> Dice
      | Dice " " Main {% (d) => [d[0], d[2]].flat()%}
```

The post processing step on the second rule makes it so that we get an easy to parse output with an array of dice objects, instead of a deeply nested array.


# Advantage/Disadvantage
Last thing I want to add to the language is something specific to dungeons and dragons. In that game it is common to throw twenty sided dices with either advantage or disadvantage. This means you throw the dice twice and keep the largest or smallest result respectively.

I think I want to represent this as `1d20a` or `1d20d`. This got a bit messy, but here are the rules I made for it

```
Main -> BonusDice
      | BonusDice " " Main {% (d) => [d[0], d[2]].flat()%}


BonusDice -> EnhancedDice　        {% (d) => ({...d[0], bonus: 0}) %}
      	 | EnhancedDice "+" int  {% (d) => ({...d[0], bonus: d[2]}) %}

EnhancedDice -> Dice      {% (d) => ({...d[0], advantage: false, disadvantage: false}) %}
              | Dice "a"  {% (d) => ({...d[0], advantage: true, disadvantage: false}) %}
              | Dice "b"  {% (d) => ({...d[0], advantage: false, disadvantage: true}) %}

Dice -> int "d" int         {% (d) => ({count: d[0], sides: d[2]}) %}
```

# Polish
The last convenience I want in the language is the option to not specify how many dices to throw, and default to 1. So `1d20` should be the same as `d20`. Pretty simple to just add to `Dice`

```
Dice -> int "d" int         {% (d) => ({count: d[0], sides: d[2]}) %}
      | "d" int             {% (d) => ({count: 1, sides: d[1]}) %}
```

That is basically it!
The output can easily be parsed and you can create a dice roller.
Or, you can do like I did and add the dice rolling straight into the parser.

```
# this is our starting rule
Main -> MultiDice {% (d) => d[0].map(v => ({...v, sum: v.rolls.reduce((acc, val) => acc + val) + v.bonus})) %}

MultiDice -> BonusDice
           | BonusDice " " MultiDice {% (d) => [d[0], d[2]].flat()%}

BonusDice -> RolledDice　        {% (d) => ({...d[0], bonus: 0}) %}
      	   | RolledDice "+" int  {% (d) => ({...d[0], bonus: d[2]}) %}

#Do the roll directly in the parsing
RolledDice -> EnhancedDice {% (d) => ({...d[0], rolls:
									   new Array(d[0].count)
									   .fill(undefined)
									   .map(() => {
										   //Create two rolls for each dice
										   const rolls = new Array(2).fill(undefined).map(() => Math.floor(Math.random() * d[0].sides + 1))
										   if(d[0].advantage)
											   return Math.max(rolls[0], rolls[1])
										   if(d[0].disadvantage)
											   return Math.min(rolls[0], rolls[1])
										   else return rolls[0]
									   })}) %}

EnhancedDice -> Dice      {% (d) => ({...d[0], advantage: false, disadvantage: false}) %}
              | Dice "a"  {% (d) => ({...d[0], advantage: true, disadvantage: false}) %}
			  | Dice "b"  {% (d) => ({...d[0], advantage: false, disadvantage: true}) %}

Dice -> int "d" int         {% (d) => ({count: d[0], sides: d[2]}) %}
      | "d" int             {% (d) => ({count: 1, sides: d[1]}) %}

int -> [0-9]:+        {% (d) => parseInt(d.flat().join("")) %}
```

It got a bit messy, but pretty neat to get an output with a list of all the dice values and the result of adding them all together

Here is an example of the output if run with the input `1d20a+2 d4+1`

```json
[
  {
    count: 1,
    sides: 20,
    advantage: true,
    disadvantage: false,
    rolls: [14],
    bonus: 2,
    sum: 16
  },
  {
    count: 1,
    sides: 4,
    advantage: false,
    disadvantage: false,
    rolls: [4],
    bonus: 1,
    sum: 5
  }
]
```

# Final words
Nearley might not have been the best fit for this, but it was in all honesty really fun to use. And the result speaks for itself, it works and is pretty neat.
The best part is that it is quite easy to build upon.

Now all that is missing is to starting using this system, and while implementing this I was thinking of creating a system like the one in [DnDBeyond](https://www.dndbeyond.com/) where you have 3D dice rolling on the screen.
Would be fun to experiment with, and should be doable using [three.js](https://threejs.org/) without too much effort