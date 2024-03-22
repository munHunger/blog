---
title: 'Svelte class prefix'
image: '/blog/svelte/1/header.jpg'
summary: Adding class prefixes in svelte
created: 2024-03-22
tags:
  - 'svelte'
  - 'css'
---

I recently came across an issue with svelte, and though I would share my finding here so that anyone in the future with the same problem might stumble upon it.

So imagine you are writing a svelte component, and adding some styling to it.
You might create a class named "panel" and use it in your markup. `panel` is a pretty generic class name, but svelte will create a hash for your component and make sure that your new `panel` class only applies to elements that also have the svelte hash as a class. I think this is a really smart way of solving css isolation. But the issue is that it only goes in one direction. If we assume that we are in a complex systems with multiple frameworks fighting for attention, it seems not unlikely that someone else has defined a class named `panel`. Svelte will of course not modify that component, but since svelte doesn't change the name of your classes we will inherit the styling of `panel` defined outside of our component.

The issue is in sveltes defense, not a common one and not one I would like the maintainers to fix. And actually it is not even a bad thing that it works this way because it allows us to import an outdated css framework such as bootstrap and use their classes.

But ok, let us say we want to fix it!
We can write a plugin that prefixes all of our classes, so that `panel` becomes `prefix-panel` and in the case of global styles, we can "import" them by writing `@panel` and then in the plugin we strip the `@` sign, thus allowing global css styles to affect it


```ts
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'

import translations from "./Scripts/Svelte/translationExtractor.js"

import { compile, parse, walk } from 'svelte/compiler';

import MagicString from 'magic-string';

export default {
  preprocess: [vitePreprocess(),
  {
    name: "class prefixer",
    markup: ({ content, filename }) => {
      let result = new MagicString(content, { filename });
      const ast = parse(content, { filename })
      walk(ast, {
        enter(node, parent, prop, index) {
          const data = {
            ...node,
            text: content.substring(node.start, node.end)
          }
          if (node.type === "Attribute" && node.name === "class") {
            for (let c of node.value) {
              if (c.data) {
                result.overwrite(c.start, c.end, c.data.split(" ").map(c => c.startsWith("@") ? c.substring(1) : ("prefix-" + c)).join(" "))
              }
            }
          }
          if (node.type === "ClassSelector" && !node.name.startsWith("@")) {
            if (node.name.startsWith("@")) {
              result.overwrite(node.start, node.end, "." + node.name.substring(1))
            }
            else {
              result.overwrite(node.start, node.end, ".prefix-" + node.name)
            }
          }
          if (node.type === "Class") {
            const start = node.start + "class:".length
            const end = node.start + "class:".length + node.name.length
            if (node.expression.type === "Identifier" && node.end == end) {
              result.overwrite(start, end, `prefix-${node.name}={${node.expression.name}}`)
            }
            else {
              result.overwrite(start, end, "prefix-" + node.name)
            }
          }
        }
      })
      return {
        code: result.toString(),
        map: result.generateMap()
      };
    },
  }
  ]
}
```

The heavy lifting of course comes from the great plugin support from svelte and the access to its' compile/parse methods, and `MagicString` which is a great package for updating multiple places in a string (a package that I will likely put to use in the future)