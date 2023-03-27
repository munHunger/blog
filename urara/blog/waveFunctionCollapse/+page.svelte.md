---
title: 'wave function collapse'
image: '/blog/waveFunctionCollapse/header.jpg'
summary: Implementing the wave function collapse and using it to generate a small factory floor
created: 2023-02-06
tags:
  - 'procedural generation'
  - 'typescript'
  - 'wave function collapse'
  - 'algorithm'
flags:
  - hidden
---

<script>
      import SceneRender from "$lib/components/extra/waveFunctionCollapse/sceneRender.svelte"
      import SteppableScene from "$lib/components/extra/waveFunctionCollapse/steppableScene.svelte"
      import RuleBuilder from "$lib/components/extra/waveFunctionCollapse/ruleBuilder.svelte"
      import Solver from "$lib/components/extra/waveFunctionCollapse/solver.svelte"
</script>

[Wave function collapse](https://en.wikipedia.org/wiki/Wave_function_collapse) is a phenomena in quantum physics where a particle or photon goes from behaving as wave to having a known position (from superposition to a single eigenstate).
That sentence is probably wildly inacurate, but I am not a quantum physicist.
So why am I writing about it?

Well, there is an algorithm that cleverly has the same name as that phenomena. And more likely than not, you have used it before.
Imagine solving a completely empty sodoku. When you start out all cells can be all values, but as soon as you enter a value somewhere(at random) the wave collapses and you impose rules on other cells.
Following these easy steps you can collapse the entire board into a "valid" state.

So the "only" thing to wave function collapse is to figure out what those rules are. Like in sodoku where each number can only appear once per row, per column, and per 3x3 square.

# Getting  into it

In this blog post we will use wave function collapse to generate a small factory room.
And we will start by looking at these four components that I got from [Kenney](https://www.kenney.nl/assets/conveyor-kit).
<SceneRender />
An empty floor, a box, a conveyor, and a conveyor starting point

We can setup some easy rules for this, for example:
* a box needs to be next to at least one conveyor
* a conveyor can not be horizontally adjacent to a floor
* the conveyor starting point needs to be adjacent to a conveyor
* the floor can go anywhere 

So, lets create a six by six grid to play around with.
<SceneRender scene={new Array(6).fill(undefined).map(() => new Array(6).fill(undefined).map(() => ({type: 'interactive', click: (ctx) => ctx.entity.type=ctx.asset})))}/>

Notice the numbers on top of each cube, they represent the amount of possible components at each square.
To begin with everything is valid, but try clicking a center cube and selecting a conveyor.

You will notice that the numbers update and to the left and right of the conveyor it says **3**, since our rules do not allow us to have a floor next to a conveyor.

If you keep selecting valid components you will sooner or later see that adjacent cubes gets updated since there is only one valid option.

# Automation

Clicking around in a janky UI like this might be fun and all, but it does get tiresome, so let me introduce a button that just picks a random square and a random valid component for us.

<SteppableScene />

This is a very simple implementation and you might have noticed that it did not manage to "solve" the scene and ended up with one or more squares where nothing could be placed. 
Once again it works like sodoku. You do your best and in some scenarios you need to guess and see where that leads you. If it doesn't work, then you backtrack to the stage where your last guess where... I know that the true sodoku pro solvers don't do any guessing, so this might just be my way of doing it. In any case this is generally how you do it with wave function collapse as well. If you end up in an unsolvable state you should backtrack a bit and try again.

We will not go into details on backtracking in this post.

But I want to show the code of this basic wave function collapse

```ts title="entities.ts"
function checkHorizontal(ctx: { scene: Array<Array<{ type: string }>>, x: number, y: number }, type: Array<string>, depth = 99, strict: boolean = false) {
    let offset = 1
    let count = 0

    if (!strict)
        type.push("interactive") //since this is a wildcard it should be valid (I call an empty square "interactive" in my code for some reason)
    while (type.includes(((ctx.scene[ctx.x + offset] || [])[ctx.y] || {}).type) && offset <= depth) {
        count++
        offset++
    }
    offset = -1
    while (type.includes(((ctx.scene[ctx.x + offset] || [])[ctx.y] || {}).type) && -offset <= depth) {
        count++
        offset--
    }
    return count
}

export abstract class Entity {
    constructor(public x: number, public y: number) {
    }
    abstract isInvalid(scene: Array<Array<{ type: string }>>): boolean
    abstract name: string
}

export class Box extends Entity {
    name = 'box'
    isInvalid(scene: { type: string; }[][]): boolean {
        return checkHorizontal({ scene, x: this.x, y: this.y }, ['conveyor'], 1) < 1
    }
}

export class Conveyor extends Entity {
    name = 'conveyor'
    isInvalid(scene: { type: string; }[][]): boolean {
        return checkHorizontal({ scene, x: this.x, y: this.y }, ['box', 'conveyor', 'conveyor-start'], 1) !== 2 ||
            (checkHorizontal({ scene, x: this.x, y: this.y }, ['conveyor-start'], 1, true) >= 2)
    }
}

export class ConveyorStart extends Entity {
    name = 'conveyor-start'
    isInvalid(scene: { type: string; }[][]): boolean {
        return checkHorizontal({ scene, x: this.x, y: this.y }, ['conveyor'], 1) < 1
    }
}

export class Floor extends Entity {
    name = 'floor'
    isInvalid(scene: { type: string }[][]): boolean {
        return false
    }
} 
```

As you can see I framed the rules as "what is not valid". This way I can try to place for example an `Conveyor` in a square and check if the entire board is valid. If it is not, then that `Conveyor` cannot be placed in that square.

Worth noting that nowhere do I state that this is the way to do it, or that this is in any way performant. It is just the first hacky solution that I got working, and we will update these rules further on in this post.

In a real world scenario you can expand a lot on these rules. For example you can generate a room, and that room would be invalid if it did not have a door, which would force the algorithm to place a door.

But in this post we will stick to simple adjacency rules.

```js title="wfc.js"
function step() {
  do {
    updateAllowList()
  } while (solveForced() > 0)
}

function cloneScene() {
  return JSON.parse(JSON.stringify(scene))
}

function updateAllowList() {
  scene.forEach((col, x) =>
    col.forEach((entity, y) => {
      if (entity.type !== 'interactive') return
      const allowList = [new Box(x, y), new Floor(x, y), new Conveyor(x, y), new ConveyorStart(x, y)]
        .filter(type => {
          let sceneClone = cloneScene()
          sceneClone[x][y].type = type.name
          let valid = true
          for (let xX = 0; xX < sceneClone.length; xX++) {
            for (let yY = 0; yY < sceneClone[xX].length; yY++) {
              let active = [new Box(xX, yY), new Floor(xX, yY), new Conveyor(xX, yY), new ConveyorStart(xX, yY)].find(
                v => v.name == sceneClone[xX][yY].type
              )
              if (active && active.isInvalid(sceneClone)) valid = false
            }
          }
          return valid
        })
        .map(v => v.name)
      solver[x][y] = assets.filter(v => allowList.includes(v))
    })
  )
}

function solveForced() {
  let solvedCount = 0
  solver.forEach((col, x) =>
    col.forEach((cell, y) => {
      if (cell.length === 1 && scene[x][y].type == 'interactive') {
        if (rules[cell[0]]) {
          rules[cell[0]].apply({}, [{ scene, x, y, checkHorizontal, updateAllowList }])
        }
        scene[x][y].click({ scene, entity: scene[x][y], x, y, asset: cell[0] })
        solvedCount++
      }
    })
  )
  return solvedCount
}
```

So in essence what we do is, we go through the entire scene and check which entities are valid for each square.
If we find one or more places where only one entity is valid, we place it and repeat.

# Automating the rules

Since the rules we specified are so simple, I think we can automate the creation of it.
The way to do it is to take an example hand crafted scene and check what objects are allowed next to eachother.

It is a bit tedious to build one of these input scenes, so I've spared you from having to do it and we will use this scene that I threw together as a baseline

<RuleBuilder />

And for reference this is how I decided to represent it
```js title="wfc.js"
//<entity name>:<rotation of the entity in 90 degree increments>
export let defaultScene = [
  ['wall-corner:0', 'wall:1', 'wall:1', 'door:1', 'wall:1', 'wall:1', 'wall:1'],
  ['wall:0', 'floor:0', 'floor:0', 'floor:0', 'floor:0', 'box:0', 'floor:0'],
  ['wall:0', 'box:0', 'floor:0', 'floor:0', 'floor:0', 'conveyor-open:0', 'floor:0'],
  ['door:0', 'floor:0', 'floor:0', 'floor:0', 'floor:0', 'conveyor:0', 'floor:0'],
  ['wall:0', 'floor:0', 'floor:0', 'floor:0', 'floor:0', 'conveyor-cover:0', 'floor:0'],
  ['wall:0', 'floor:0', 'floor:0', 'floor:0', 'floor:0', 'conveyor-open:0', 'floor:0'],
  ['port:0', 'floor:0', 'conveyor-start:1', 'conveyor:1', 'conveyor-open:1', 'conveyor-open:0', 'floor:0'],
  ['wall:0', 'floor:0', 'floor:0', 'floor:0', 'floor:0', 'floor:0', 'floor:0'],
  ['wall:0', 'conveyor-start:1', 'conveyor:1', 'conveyor:1', 'conveyor-cover:1', 'conveyor-open:1', 'box:0'],
  ['wall:0', 'floor:0', 'floor:0', 'floor:0', 'floor:0', 'floor:0', 'floor:0'],
  ['wall-corner:3', 'wall:3', 'wall:3', 'wall:3', 'wall:3', 'wall:3', 'wall:3']
]
```

So lets' see what rules we can manage to extract from this scene. We will begin by simply counting how many times entities occur next to each other. For example how often is there a conveyor to the left and right of a box.

```js title="wfc.js"
  function unique(value, index, self) {
    return self.indexOf(value) === index
  }
  export let scene = defaultScene.map(v => v.map(a => ({ type: a.split(':')[0], rot: a.split(':')[1] })))
  let adjacencyCount = {}

  /**
   * Take the default scene and map it into a list of unique assets
   * Have each asset represent a list of all other unique assets with a horizontal and vertical count
   */
  defaultScene
    .flat()
    .filter(unique)
    .forEach(asset => {
      adjacencyCount[asset] = {}
      defaultScene
        .flat()
        .filter(unique)
        .forEach(other => (adjacencyCount[asset][other] = { horizontal: 0, vertical: 0 }))
    })

  for (let x = 0; x < defaultScene.length; x++) {
    for (let y = 0; y < defaultScene[x].length; y++) {
      // we will only use manhattan adjacency so diagonals are irrelevant
      for (let xX = -1; xX <= 1; xX += 2) {
        if (x + xX >= 0 && x + xX < defaultScene.length)
          adjacencyCount[defaultScene[x][y]][defaultScene[x + xX][y]].horizontal++
      }
      for (let yY = -1; yY <= 1; yY += 2) {
        if (y + yY >= 0 && y + yY < defaultScene[x].length)
          adjacencyCount[defaultScene[x][y]][defaultScene[x][y + yY]].vertical++
      }
    }
  }
```
with that code that does not follow industry standards of not having side effects, the `adjacencyCount` should look something like this
```json
{
  "wall:1": {
    "wall-corner:0": {
      "horizontal": 0,
      "vertical": 1
    },
    "wall:1": {
      "horizontal": 0,
      "vertical": 6
    },
    "door:1": {
      "horizontal": 0,
      "vertical": 2
    },
    "wall:0": {
      "horizontal": 0,
      "vertical": 0
    },
    "floor:0": {
      "horizontal": 4,
      "vertical": 0
    },
    "box:0": {
      "horizontal": 1,
      "vertical": 0
    },
    "conveyor-open:0": {
      "horizontal": 0,
      "vertical": 0
    }
  }
}
```
A bit shortened of course to focus on the important aspects.
But that object tells us that there are 6 walls with a rotation value of 1 stacked next to eachother vertically.
It also tells us that there is one box in front of a wall.
Looking at it the other way around we see that it is not allowed to have a `conveyor-open` object anywhere near a wall.

I want to extend it a little bit so that we know more than just "is it valid", and adding a probablity of how likely it is that a box is in front of a wall.
```js title="wfc.js"
  let rules = {}
  Object.keys(adjacencyCount).forEach(entityKey => {
    let entity = adjacencyCount[entityKey]
    // figure out the statistical probability of there being an x horizontally adjacent
    let totalHorizontal = Object.values(entity)
      .map(v => v.horizontal)
      .reduce((acc, val) => acc + val, 0)
    let horizontalRules = Object.keys(entity)
      .map(v => ({
        entity: v,
        odds: entity[v].horizontal / totalHorizontal
      }))
      .filter(v => v.odds > 0)

    let totalVertical = Object.values(entity)
      .map(v => v.vertical)
      .reduce((acc, val) => acc + val, 0)
    let verticalRules = Object.keys(entity)
      .map(v => ({
        entity: v,
        odds: entity[v].vertical / totalVertical
      }))
      .filter(v => v.odds > 0)

    rules[entityKey] = { horizontalRules, verticalRules }
  })
```
So now we should have a normalized list of possible entities
```json
{
  "wall:1": {
    "horizontalRules": [
      {
        "entity": "floor:0",
        "odds": 0.8
      },
      {
        "entity": "box:0",
        "odds": 0.2
      }
    ],
    "verticalRules": [
      {
        "entity": "wall-corner:0",
        "odds": 0.1111111111111111
      },
      {
        "entity": "wall:1",
        "odds": 0.6666666666666666
      },
      {
        "entity": "door:1",
        "odds": 0.2222222222222222
      }
    ]
  }
}
```

With this it is clear that there is a 1 in 5 that there if a box and not a floor in front of a wall.
We will not get any rules saying that if there is a box next to a conveyor, there has to be another conveyor next to that conveyor. But I think this should suffice

Here is the solver I made using the rules extracted from the default scene.

<Solver />

# Results
The first solution I got looked like this

![conveyors conveyors and conveyors](/blog/waveFunctionCollapse/2023-02-06_10-06.png)

Which was 100% user error my part, but I found it pretty funny. It also gave me the idea to bootstrap the solver by placing a corner wall at the corner of the scene.
This forced the solver to add some walls, and from time to time it added a **lot** of walls

But in general the result looked acceptable, albeit far from great
![random conveyors](/blog/waveFunctionCollapse/2023-02-06_10-24.png)
![acceptable result](/blog/waveFunctionCollapse/2023-02-06_10-32.png)


In all honesty I did not expect it to be this far from perfect, but from time to time it produces an acceptable result.
And to be fair, it makes perfect sense that it looks like crap, only looking at the immediately adjacent entites will result in a pretty limited ruleset.

If I were to expand on this I would force it to encase the scene in walls, by making a rule that checks the perimiter of the scene and making it invalid if it is not encased.
Then I would add rules for minimum amount of objects. For example a room would not be complete without a door, or a box, or a conveyor. Given adjacency rules that would force the door to be placed on a wall and not freestanding in the middle of the room.

