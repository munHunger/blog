---
title: 'Dungeons and dragons screen'
image: '/hello-world/urara.webp'
created: 2023-01-26
updated: 2023-01-26
tags:
  - 'D&D'
  - 'javascript'
  - 'typescript'
  - 'query'
  - 'data'
  - 'yaml'
---

For my upcoming Dungeons and Dragons I wanted to do all of my world building in a computer readable format.
And I was pretty sure I wanted to write that format as well, so I picked `yaml`.
One could ask why I didn't pick ex markdown and it is because the structure wouldn't feel right for me, and the metadata does not work the way I want it to.
For example I think it would be a good idea to have one single yaml file for the whole of a political organization in my game. 
That one yaml file can then easily contain the history of the organization, all needed NPCs, and potential quest lines, something I don't find viable in a markdown format.


Here is an example of a yaml file I created for my D&D world (in a cyberpunk setting)
```yaml
name: Neon Chroma
description: The neon chroma is a really small bar with all seating out on the road. It is dimly lit with neon signs
npc:
  - name: Neo
    race: near human
    description: A charismatic android with a dry wit, Neo enjoys chatting with patrons about the latest tech advancements.
signatureDrink: |-
  Neo's Blissful Elixir: Create a unique blend of equal parts vodka, amaretto, and blueberry flavored syrup. Pour into an ice-filled shaker and shake vigorously. Serve in a martini glass with a lime wedge garnish.
```

I think this is a pretty nifty way of documenting, but there is *one* issue.
Across the many files created, how do I find all the signature drinks that exists in my world?
... ok, not a likely query, or thought to have, but you get the idea.

I suppose I could push it into a real indexing engine, such as Elasticsearch, but wow that would be such an overkill for a some homebrew game.
Another less extreme option would be to use a normal NOSQL database such as mongo, which would be able to query this data for me. 
But, I would prefer to skip the complexity of having a separate server/database all together.

This led me to implement my own simple query system.

```js
query(`.signatureDrink`)
```

That query should be able to fetch all drinks for me.
So how to implement it?

I did a naive approach of reading all yaml files into memory, which honestly works fine, my campaign really isn't that big, and is unlikely to ever get so big that it becomes an issue.

I then wrote a small script
```typescript
function nextQry(query) {
  if (query.substring(1).split("").includes(".")) {
    return query.substring(1).split(".").slice(1).join(".");
  }
}
function arrayQuery(array, query) {
  if (query.startsWith("[")) {
    console.log("array search");
    const item = eval("array" + query.substring(0, query.indexOf("]") + 1));
    if (item && typeof item === "object") return anyQuery(item, nextQry(query));
    if (item) return item;
    return;
  }
  if (!query.startsWith(".")) {
    query = "." + query;
  }
  var newArray = [];
  for (var i = 0; i < array.length; i++) {
    var item = array[i];
    if (typeof item === "object") {
      const res = anyQuery(item, query);
      if (res) {
        newArray.push(res);
      }
    } else if (eval("item" + query)) {
      newArray.push(item);
    }
  }
  return newArray;
}

function objectQuery(obj, query) {
  if (!query.startsWith(".")) {
    query = "." + query;
  }
  const next = nextQry(query);
  const current = eval("obj" + query.split(".").slice(0, 2).join("."));
  if (next && current) return anyQuery(current, next);

  if (current) {
    if (typeof current === "number" || typeof current === "string")
      return current;
    return obj;
  }
}

function anyQuery(anyData, query) {
  if (Array.isArray(anyData)) return arrayQuery(anyData, query);
  return objectQuery(anyData, query);
}
```

And with that I could send an array of all my files (parsed from yaml) into `anyQuery` and get a list of all drinks in all files.

Of course this assumes that I spell the property correctly every time, but I suppose I can't really get around human errors