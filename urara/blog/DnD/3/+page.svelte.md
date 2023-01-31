---
title: 'Rolling dice with three js'
image: '/blog/DnD/3/header.jpg'
created: 2023-01-31
summary: Using a rigid body simulation to roll dice using three js and rapier, wrapped with threlte
tags:
  - 'DnD'
  - 'javascript'
  - 'three js'
  - 'threlte'
  - 'rapier'
---
<script>
      import Initial from "$lib/components/extra/threejsDice/initial.svelte"
      import D20untexture from "$lib/components/extra/threejsDice/d20untexture.svelte"
      import D20textured from "$lib/components/extra/threejsDice/d20textured.svelte"
      import Rolling from "$lib/components/extra/threejsDice/rolling.svelte"
      import Drop from "$lib/components/extra/threejsDice/drop.svelte"
      import Canvas from "$lib/components/extra/threejsDice/canvas.svelte"
</script>

Following up on my last post about a [dice expression parser](/blog/DnD/2) I wanted to create a simple 3d dice roller.

Turns out it was not as simple as I expected, but then again, I have no experience at all of this type of stuff.

So for anyone else wanting to get into 3d browser stuff, let the blind lead the blind.

# Setting up three js
OK, so [three js](https://threejs.org/) seems to be some form of standard when it comes to browser 3D stuff. I started using it, but ran into some issues when trying to use physics. Stepping up a level in abstraction I found [threlte](https://threlte.xyz/) which is a threejs wrapper for svelte. You still have access to everything threejs, but it comes with sensible defaults and it has an easy to use integration with [rapier](https://rapier.rs/). With rapier and threlte, physics was a lot easier than running with threejs and [ammo](https://github.com/kripken/ammo.js/) or [cannon-es](https://github.com/pmndrs/cannon-es)

Now that we know what to use and what abstraction level to be at, lets get started and create a basic scene. I think it makes sense to steal from the best, so following the getting [started guide at threlte](https://threlte.xyz/getting-started#first-scene), and mofifying it slightly we get something like this

<Canvas>
<Initial />
</Canvas>

```html title="Canvas.svelte"
<script>
  import { Canvas } from '@threlte/core'
</script>

<div class="h-96">
  <Canvas>
    <slot />
  </Canvas>
</div>
```
```html title="diceRoller.svelte"
<script>
  import { OrbitControls, T } from '@threlte/core'
  import { degToRad } from 'three/src/math/MathUtils'
</script>

<T.PerspectiveCamera makeDefault position={[0, 10, 10]} fov={24}>
  <OrbitControls maxPolarAngle={degToRad(80)} enableZoom={false} target={{ y: 0.5 }} />
</T.PerspectiveCamera>

<T.DirectionalLight castShadow position={[3, 10, 10]} />
<T.DirectionalLight position={[-3, 10, -10]} intensity={0.2} />
<T.AmbientLight intensity={0.2} />

<T.Group>
  <T.Mesh position.y={0.5} castShadow let:ref>
    <T.BoxGeometry />
    <T.MeshStandardMaterial color="#333333" />
  </T.Mesh>
</T.Group>

<T.Mesh receiveShadow rotation.x={degToRad(-90)}>
  <T.CircleGeometry args={[3, 72]} />
  <T.MeshStandardMaterial color="white" />
</T.Mesh>
```
Note that we are using a separate component just for the canvas.
The reason for this is so that we later on can use the hook [`useThrelte`](https://threlte.xyz/core/use-threlte) that gives us access to the threejs scene graph. It will be more obvious later on why this is needed.


# Making it look like a dice

I want to focus this blog on only one dice, and I don't want to make it easy. So lets focus on a twenty sided dice.

There might a "pre-made" geometry for it, but I've exported a one segment ico sphere from [blender](https://www.blender.org/). 
If you want to follow along you can download it [here](/assets/d20.obj).

So now lets load the dice.

<Canvas><D20untexture /></Canvas>

```html title="diceRoller.svelte" {7-16, 27-44}
<script>
  import { useLoader, OrbitControls, T, Mesh } from '@threlte/core'
  import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'
  import { degToRad } from 'three/src/math/MathUtils'
  import { onMount } from 'svelte'
  import { CircleGeometry, DoubleSide, MeshStandardMaterial } from 'three'

  /**
   * @type {import("three").BufferGeometry}
   */
  let d20Mesh
  const loader = useLoader(OBJLoader, () => new OBJLoader())
  onMount(() => {
    loader.load('/assets/d20.obj', obj => {
      d20Mesh = obj.children[0].geometry
    })
  })
</script>

<T.PerspectiveCamera makeDefault position={[0, 10, 10]} fov={24}>
  <OrbitControls maxPolarAngle={degToRad(80)} enableZoom={false} target={{ y: 0.5 }} />
</T.PerspectiveCamera>

<T.DirectionalLight castShadow position={[3, 10, 10]} />
<T.DirectionalLight position={[-3, 10, -10]} intensity={0.2} />
<T.AmbientLight intensity={0.2} />

<T.Group>
  <Mesh
    position={{ x: 0, y: 1.5, z: 0 }}
    castShadow
    geometry={d20Mesh}
    material={new MeshStandardMaterial({ color: '#333333', side: DoubleSide })} />
</T.Group>

<Mesh
  receiveShadow
  interactive
  rotation={{ x: degToRad(-90) }}
  material={new MeshStandardMaterial({ color: 'white' })}
  geometry={new CircleGeometry(3, 72)} />
```
We load the dice by declaring that we are to use a `.obj` loader, and asynchronously load it when the svelte component is ready.

And we update the `<T.Mesh>` component to one of the clearer threlte wrapped `<Mesh>` components. With this component it is pretty easy to just jack in our loaded obj mesh.

Before moving on to physics and dice rolling, lets throw a texture on the dice so that we can see the value of each face. I hastily made one that you can find [here](/assets/d20.jpg). It does not look good, but it gets the job done.

<Canvas><D20textured /></Canvas>

```html title="diceRoller.svelte"
<script>
  let d20Texture
  const loader = useLoader(OBJLoader, () => new OBJLoader())
  const textureLoader = useLoader(TextureLoader, () => new TextureLoader())
  onMount(() => {
    textureLoader.load('/assets/d20.jpg', texture => {
      texture.magFilter = NearestFilter
      texture.minFilter = LinearMipMapNearestFilter
      d20Texture = texture
    })
  })
</script>
  <Mesh
    position={{ x: 0, y: 1.5, z: 0 }}
    castShadow
    geometry={d20Mesh}
    material={new MeshStandardMaterial({ map: d20Texture, side: DoubleSide })} />
```
Somewhat abreviated, but pretty straightforwards.
In the same way as with the dice we declare that we want to use a `TextureLoader`, and use it to load our texture jpg. The texture can then be added easily to our dice mesh material.
Note that the `magFilter` and `minFilter` settings aren't needed, but it indicates to threejs how it should scale/shrink textures.

# Throwing dice

Alright, lets get to the interesting stuff. 
I wish I could give you more of these "live views" but unfortunately rapier does not play nice when there is more that one physics world loaded.

But lets get into it anyways.

So to begin with we need to wrap our scene in a `<World>` tag.
And then we need some static colliders
```html title="diceRoller.svelte"
  <!--floor-->
  <Collider shape="cuboid" args={[100, 0.1, 100]} />

  <!--top and bottom wall-->
  <Collider shape="cuboid" args={[1000, 100, 1]} position={{ x: 0, y: 0, z: 10 }} />
  <Collider shape="cuboid" args={[1000, 100, 1]} position={{ x: 0, y: 0, z: -7 }} />
  <!--left and right wall-->
  <Collider shape="cuboid" args={[1, 100, 1000]} position={{ x: 10, y: 0, z: 0 }} />
  <Collider shape="cuboid" args={[1, 100, 1000]} position={{ x: -10, y: 0, z: 0 }} />
```

These colliders are there so that our dice don't just fall into the void, and they are somewhat contained within our viewport.
Without knowing I feel pretty confident in saying that this for sure is not the smartest approach, and you would want something that is easier to adapt to whatever the camera i seeing/the canvas ration. *But* this works, and it is good enough for experimenting with.

Now that we have the static colliders defined, we need to add a rigid body to our dice.
And to clarify a collider is a static object that is not moving and that is not rendered. A rigidbody is affected by physics, can be rendered, and collides with colliders and other rigid bodies.

```html
      <RigidBody
        bind:rigidBody={d}
        position={{ x: Math.random(), y: 4, z: 8 }}
        linearVelocity={{ x: Math.random() * 8 - 4, y: Math.random(), z: Math.random() * -20 }}
        angularVelocity={{
          x: Math.random() * 3,
          y: Math.random() * 3,
          z: Math.random() * 3
        }}>
        <AutoColliders shape="convexHull" mass={0}>
          <Mesh />
        </AutoColliders>
      </RigidBody>
```
So by wrapping our dice with `<RigidBody>` and `<AutoColliders>` it becomes part of the physics simulation.

Note that we are setting a both a linear and an angular velocity on the rigid body, meaning that we will "throw" it with some spin applied.

Additionally and this is **very important**, you need to remove the position from the mesh and add it soley to the rigid body. We will go into more details about this later.

But with all of this we should have something that looks like this
<Canvas><Rolling /></Canvas>

It is not perfect, but it works and I am pretty happy with it, even though I wouldn't push it to anything near production ready code.

# Reading the dice

This part took me a bit over a day to figure out, but we need to read the face of the dice we just threw.
In theory there is a pretty simple way of doing it. Just do a [raycast](https://threejs.org/docs/#api/en/core/Raycaster) from straight above each dice down into the ground.
The raycast should give two faces, the top and bottom one. The bottom one can easily be discarded because it is further from the raycast origin. With the top face you can then cross reference the mesh face index with the face value... sounds simple, so why did it take me so long to do, and why did I say that it is simple in theory?

Well, as I mentioned when adding the `<RigidBody>` tag it is important to move the position away from the `<Mesh>` tag. I had overlooked that part, and thus I was not sending a raycast from the center of the dice, and in some scenarios I completely missed the dice altogether.

The code for it is pretty simple though
```js
// faceindex to dice face
let faceToDice = {
  3: 1,
  16: 2,
  1: 3,
  18: 4,
  12: 5,
  14: 6,
  2: 7,
  10: 8,
  9: 9,
  6: 10,
  13: 11,
  11: 12,
  8: 13,
  19: 14,
  7: 15,
  5: 16,
  0: 17,
  17: 18,
  4: 19,
  15: 20
}
dice.forEach((d, i) => {
  //Get the position of the dice
  let trans = d.translation()
  //send the raycast from above the dice in a downwards direction
  const raycaster = new Raycaster(new Vector3(trans.x, trans.y + 5, trans.z), new Vector3(0, -1, 0), 0.1, 15)
  let intersects = raycaster.intersectObjects(three.scene.children, true)
  //The raycast could intersect with more than one dice, so filter out our own
  intersects = intersects.filter(intersect => intersect.object.id === diceMesh[i].id)
  let inter = intersects[0] // raycast will likely exit the other side and give 2 faces. ordered by distance first should be pointing up
  console.log(`rolled a ${faceToDice[inter.faceIndex]}`)
})
```

# Ending words
That is basically it. Not an extremely complex task, but it took more time than I imagined.
Is this the right way of doing it? no, 100% not. For instance I wouldn't trust that these dice are perfectly random, even though they should be in theory.

To do this "right" I think it is a better approach to run through the simulation and check what `faceIndex` is pointing up, and then with a normal `Math.random()` paint on the value on that face, instead of leaving the randomness up to the physics engine.

## Final code
In case you want to reference my code, here it is
```html title="diceRoller.svelte"
<script>
  import { useLoader, DirectionalLight, AmbientLight, PerspectiveCamera, Mesh, useThrelte } from '@threlte/core'
  import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'
  import { OrbitControls, T } from '@threlte/core'
  import { World, RigidBody, AutoColliders, Collider } from '@threlte/rapier'
  import {
    MeshStandardMaterial,
    ShadowMaterial,
    CircleGeometry,
    TextureLoader,
    NearestFilter,
    LinearMipMapNearestFilter,
    Raycaster,
    Vector3,
    DoubleSide
  } from 'three'
  import { degToRad } from 'three/src/math/MathUtils'
  import { spring } from 'svelte/motion'
  import { onMount } from 'svelte'

  // faceindex to dice face
  let faceToDice = {
    3: 1,
    16: 2,
    1: 3,
    18: 4,
    12: 5,
    14: 6,
    2: 7,
    10: 8,
    9: 9,
    6: 10,
    13: 11,
    11: 12,
    8: 13,
    19: 14,
    7: 15,
    5: 16,
    0: 17,
    17: 18,
    4: 19,
    15: 20
  }

  const three = useThrelte()

  const scale = spring(1)

  const angularStrength = 10

  /**
   * @type {import("three").BufferGeometry}
   */
  let d20Mesh
  let d20Texture

  const loader = useLoader(OBJLoader, () => new OBJLoader())
  const textureLoader = useLoader(TextureLoader, () => new TextureLoader())
  onMount(() => {
    textureLoader.load('/assets/d20.jpg', texture => {
      texture.magFilter = NearestFilter
      texture.minFilter = LinearMipMapNearestFilter
      d20Texture = texture
    })
    loader.load('/assets/d20.obj', obj => {
      d20Mesh = obj.children[0].geometry
      d20Mesh.computeVertexNormals()
      d20Mesh.normalizeNormals()
      console.log(d20Mesh)
    })
    setTimeout(rollDice, 300)
  })
  function random(min, max) {
    // min and max included
    return Math.random() * (max - min + 1) + min
  }
  /**
   * @type {Array.<import('@dimforge/rapier3d-compat').RigidBody>}
   */
  let dice = new Array(10).fill(undefined)
  /**
   * @type {Array.<import("three").BufferGeometry>}
   */
  let diceMesh = new Array(10).fill(undefined)

  /**
   * @type {import("three").PerspectiveCamera}
   */
  let camera
  async function rollDice() {
    dice.forEach((d, i) => {
      d.setTranslation({ x: random(-1, 1), y: 4, z: 8 }, true)
      d.setLinvel({ x: random(-2, -2), y: 0, z: random(-18, -14) }, true)
      d.setAngvel(
        {
          x: random(-angularStrength, angularStrength),
          y: random(-angularStrength, angularStrength),
          z: random(-angularStrength, angularStrength)
        },
        true
      )
    })
    await waitUntilStopped()
    console.log('dice roll complete')
    dice.forEach((d, i) => {
      let trans = d.translation()
      const raycaster = new Raycaster(new Vector3(trans.x, trans.y + 5, trans.z), new Vector3(0, -1, 0), 0.1, 15)
      let intersects = raycaster.intersectObjects(three.scene.children, true)

      intersects = intersects.filter(intersect => intersect.object.id === diceMesh[i].id)
      if (intersects.length == 2) {
        let inter = intersects[0] // raycast will likely exit the other side and give 2 faces. ordered by distance first should be pointing up
        console.log(`rolled a ${faceToDice[inter.faceIndex]}`)
      } else {
        console.log('broken dice')
        if (intersects.length == 1)
          console.log(`only found one face at ${intersects[0].distance}. Should have gotten an exit hole`)
        else {
          console.log('did not find anything')
        }
      }
    })
  }

  let last
  async function waitUntilStopped() {
    const precision = 4
    const diceIndex = d => ({ trans: d.translation(), rot: d.rotation() })
    if (!last) {
      last = dice.map(diceIndex)
    } else if (
      dice.map(diceIndex).every((dI, i) => {
        return (
          dI.trans.x.toFixed(precision) === last[i].trans.x.toFixed(precision) &&
          dI.trans.y.toFixed(precision) === last[i].trans.y.toFixed(precision) &&
          dI.trans.z.toFixed(precision) === last[i].trans.z.toFixed(precision) &&
          dI.rot.x.toFixed(precision) === last[i].rot.x.toFixed(precision) &&
          dI.rot.y.toFixed(precision) === last[i].rot.y.toFixed(precision) &&
          dI.rot.z.toFixed(precision) === last[i].rot.z.toFixed(precision)
        )
      })
    ) {
      return
    }

    last = dice.map(diceIndex)
    await pause()
    return waitUntilStopped()
  }

  function pause() {
    return new Promise(function (resolve, reject) {
      setTimeout(resolve, 150)
    })
  }
</script>

<PerspectiveCamera bind:camera position={{ x: 0, y: 40, z: 0 }} fov={24}>
  <OrbitControls maxPolarAngle={degToRad(80)} enableZoom={true} target={{ y: 0.5 }} />
</PerspectiveCamera>
<DirectionalLight
  shadow={{
    mapSize: [2048, 2048],
    camera: {
      left: -20,
      right: 20,
      top: 20,
      bottom: -20,
      near: 0.0001,
      far: 100
    },
    radius: 8
  }}
  intensity={0.1}
  target={{ x: 1 }}
  position={{ x: 0, y: 10, z: 10 }} />
<DirectionalLight position={{ x: -3, y: 10, z: -10 }} intensity={0.3} />
<AmbientLight intensity={0.2} />
<World>
  {#if d20Mesh && d20Texture}
    {#each dice as d, i}
      <RigidBody
        bind:rigidBody={d}
        position={{ x: Math.random(), y: 4, z: 8 }}
        linearVelocity={{ x: Math.random() * 8 - 4, y: Math.random(), z: Math.random() * -20 }}
        angularVelocity={{
          x: Math.random() * angularStrength,
          y: Math.random() * angularStrength,
          z: Math.random() * angularStrength
        }}>
        <AutoColliders shape="convexHull" mass={0}>
          <!-- Cube -->
          <T.Group scale={$scale}>
            <Mesh
              bind:mesh={diceMesh[i]}
              position={{ x: 0, y: 0, z: 0 }}
              castShadow
              geometry={d20Mesh}
              material={new MeshStandardMaterial({ map: d20Texture, side: DoubleSide })} />
          </T.Group>
        </AutoColliders>
      </RigidBody>
    {/each}
  {/if}

  <Collider shape="cuboid" args={[100, 0.1, 100]} />

  <Collider shape="cuboid" args={[1000, 100, 1]} position={{ x: 0, y: 0, z: 10 }} />
  <Collider shape="cuboid" args={[1000, 100, 1]} position={{ x: 0, y: 0, z: -7 }} />

  <Collider shape="cuboid" args={[1, 100, 1000]} position={{ x: 10, y: 0, z: 0 }} />
  <Collider shape="cuboid" args={[1, 100, 1000]} position={{ x: -10, y: 0, z: 0 }} />

  <Mesh
    receiveShadow
    interactive
    on:click={rollDice}
    rotation={{ x: degToRad(-90) }}
    material={new ShadowMaterial({ color: '#050505' })}
    geometry={new CircleGeometry(300, 72)} />
</World>
```