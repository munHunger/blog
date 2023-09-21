---
title: 'Pasting decals in Three JS'
image: '/blog/threejs/1/header.jpg'
summary: Three JS tutorial on how to place decals or stickers on an object
created: 2023-09-21
tags:
  - 'three js'
  - 'tutorial'
---

Have you ever wanted to paste some stickers on a 3D object?
Perhaps to check what your product would look like with a sticker on it and check where the best placement is without actually placing a sticker on a real product.

You can of course do this with some pretty minor Photoshop skills, but let us dive into [three js](https://threejs.org/) and do it the hard way instead!

## Intro

I will be using svelte and the three js wrapper [threlte](https://threlte.xyz/) as that is the most convenient for me. But the concepts should translate pretty well to vanilla three js.

To start of, make sure you have your project setup and installed according to respective instructions.

## App

Best practice according to threlte is to separate your canvas and your scene, so let's do that.

```svelte title="App.svelte"
<script>
  import { Canvas } from '@threlte/core'
  import Scene from '$lib/Scene.svelte'
</script>

<div class="app">
  <Canvas>
    <Scene />
  </Canvas>
</div>
```

And for the fun of it, we might as well slap on some styling on it

```svelte title="App.svelte"
<style>
  .app {
    width: 100%;
    height: 100%;
    position: absolute;
    left: 0px;
    top: 0px;
    background: radial-gradient(circle, rgb(149, 154, 160) 0%, rgb(94, 100, 105) 100%);
    background-position: 0, 0;
  }
</style>
```

## The Scene

We will do most of the heavy lifting here, but to keep the file succinct let us break it into parts.

```svelte title="Scene.svelte"
<script>
  import Target from './Target.svelte'
  import Camera from './Camera.svelte'
  import Lights from './Lights.svelte'

  let camera
  let mesh
</script>

<Target bind:mesh />
<Camera bind:camera />
<Lights />
```

I think this is a reasonable split. So we have a component `Target` to hold the model that we are to paste decals on. We have a `Camera` component that wraps the three JS camera. And lastly we have all our lighting in a `Lights` component.

We will add the decals and the controller for that in a bit.

### Target

For the sake of it I have modelled I water bottle in blender and exported it to `GLTF` which works quite well in my experience.

```svelte title="Target.svelte"
<script>
  import { GLTF } from '@threlte/extras'
  export let mesh
</script>

<GLTF
  useDraco="https://www.gstatic.com/draco/v1/decoders/"
  url="/bottle.glb"
  on:create={({ ref }) => {
    mesh = ref.children[1]
  }} />
```

noteworthy here is that the `GLTF` loader results in a group, and my code only handles a single mesh. So in a hacky proof of concept I am just picking the second child which is the canister of the bottle. In an ideal world you would either have the code handle group, or a list of meshes and just flatmap everything.

### Camera

We want a camera, and we want to be able to rotate it around the target.
We could use an [`OrbitControls`](https://threejs.org/docs/#examples/en/controls/OrbitControls) but I find it a bit limited, and couldn't find a way to bind it to middle mouse instead of left click, that we will use for pasting decals.

so instead let us add this

```svelte title="Camera.svelte"
<script>
  import { T } from '@threlte/core'
  export let camera

  let rotation = 75 //arbitrary number
  export function drag(e) {
    if (isMiddleMouseDown) {
      rotation += e.movementX
      rotateCamera()
    }
  }

  function rotateCamera() {
    const sensitivity = 100
    const distance = 10
    const pos = [Math.sin(rotation / sensitivity), 1, Math.cos(rotation / sensitivity)].map(comp => comp * distance)
    camera.position.set(...pos)
    camera.lookAt(0, 1, 0)
    camera = camera //force svelte re-render
  }

  let isMiddleMouseDown = false
  function mouseDown(e) {
    isMiddleMouseDown = e.button === 1 //1 is middle mouse
  }
  function mouseUp(e) {
    isMiddleMouseDown = false
  }
</script>

<svelte:window on:mousedown={mouseDown} on:mouseup={mouseUp} on:mousemove={drag} />

<T.PerspectiveCamera
  makeDefault
  bind:ref={camera}
  on:create={() => {
    rotateCamera()
  }} />
```

### Lights

Ok last thing before we start working on the decals.
We of course want to add lights to our target.

```svelte title="Lights.svelte"
<script>
  import { T } from '@threlte/core'
  let l1Rot = 1
  let l2Rot = -1
</script>

<T.AmbientLight />
<T.DirectionalLight position={[Math.sin(l1Rot) * 10, 10, Math.cos(l1Rot) * 10]} castShadow intensity={0.8} />
<T.DirectionalLight position={[Math.sin(l2Rot) * 10, 10, Math.cos(l2Rot) * 10]} intensity={0.2} />
```

Note that this has similar math as the camera to rotate the position of lights around the world origin.

### Partial result

We should have something looking like this now
![scene](/blog/threejs/1/scene.png)

## Raycast

Now the fun begins!
We want to figure out if the mouse is hovering on our mesh and where.
So with some code that is shamelessly stolen and modified from [here](https://threejs.org/examples/#webgl_decals)

```js title="Scene.svelte"

let lineGeometry = new THREE.BufferGeometry()
lineGeometry.setFromPoints([new THREE.Vector3(), new THREE.Vector3()])
let line
const raycaster = new THREE.Raycaster()
const mouseHelper = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 10))
function checkIntersection(x, y) {
  if (mesh === undefined) return

  const intersection = {
    intersects: false,
    point: new THREE.Vector3(),
    normal: new THREE.Vector3()
  }

  const mouse = new THREE.Vector2()
  mouse.x = (x / window.innerWidth) * 2 - 1
  mouse.y = -(y / window.innerHeight) * 2 + 1

  raycaster.setFromCamera(mouse, camera)
  const intersects = []
  raycaster.intersectObject(mesh, false, intersects)

  if (intersects.length > 0) {
    const p = intersects[0].point
    mouseHelper.position.copy(p)
    intersection.point.copy(p)

    const n = intersects[0].face.normal.clone()
    n.transformDirection(mesh.matrixWorld)
    n.multiplyScalar(10)
    n.add(intersects[0].point)

    intersection.normal.copy(intersects[0].face.normal)
    mouseHelper.lookAt(n)
    const pos = line.geometry.attributes.position
    pos.setXYZ(0, p.x, p.y, p.z)
    pos.setXYZ(1, n.x, n.y, n.z)
    pos.needsUpdate = true
    line = line

    intersection.intersects = true

    intersects.length = 0
  } else {
    intersection.intersects = false
  }
  return intersection
}
</script>
```

this will send out a imaginary line from the center of the camera and forwards into the world, targeting the x,y position of the mouse. If that line intersects our mesh we will get a list with places where it intersects. From that list we can fetch the coordinate in 3d space as well as the normal of the face. The normal of a polygon or a face is a normalized vector that indicates where the it is facing.

This code introduces a few more variables, so let us put them to use, and add a listener for mouse movement

```svelte title="Scene.svelte"


  function mouseMove(e) {
    const intersection = checkIntersection(e.clientX, e.clientY);
  }
</script>

<svelte:window on:click={click} on:mousemove={mouseMove} />
<T.Line bind:ref={line} geometry={lineGeometry} />
```

This should give us a line pointing to the target, so that can verify that everything is working.

![line](/blog/threejs/1/line.png)

Note that the `mouseHelper` is not added to the scene. We only have it to make it easier to get the rotation of the decal.

## Decals

Now we know how to point to an object, we want to add the decals objects to it.

so let us add some code for that in the scene.

```svelte title="Scene.svelte"
<script>
  import Decals from './Decals.svelte'
  let decalRef

  function click(e) {
    const intersection = checkIntersection(e.clientX, e.clientY)
    if (intersection.intersects) {
      const rotation = new THREE.Euler().copy(mouseHelper.rotation)
      decalRef.addDecal(new THREE.Vector3().copy(intersection.point), rotation)
    } else console.log('no intersect')
  }
</script>

<svelte:window on:click={click} on:mousemove={mouseMove} />
<Decals bind:this={decalRef} {mesh} />
```

With this we add a new component and tell it to add a decal whenever we click on the target.

```svelte title="Decals.svelte"
<script>
  import { DecalGeometry } from 'three/addons/geometries/DecalGeometry.js'
  import { T } from '@threlte/core'
  import * as THREE from 'three'

  export let mesh

  const textureLoader = new THREE.TextureLoader()
  const decal = textureLoader.load('/favicon.png')
  const decalMat = new THREE.MeshPhongMaterial({
    depthWrite: false,
    polygonOffset: true, //Without this the polygons are overlapping the target and causing artifacts
    polygonOffsetFactor: -4,
    map: decal,
    transparent: true //if the decal is a png with transparency this is needed
  })

  export function addDecal(position, rotation) {
    const material = decalMat.clone()
    const size = new THREE.Vector3(1, 1, 1)
    const m = new THREE.Mesh(new DecalGeometry(mesh, position, rotation, size), material)
    m.renderOrder = decals.length // give decals a fixed render order

    decals = decals.concat([m])
  }
  let decals = []
</script>

{#each decals as decal}
  <T.Mesh is={decal} />
{/each}
```

This code is pretty short, and to the point. Most of the heavy lifting is done by the `DecalGeometry` object.

## Result

Assuming that everything has been copy pasted correctly it should look something like this.

![final](/blog/threejs/1/final.png)

If not, I suggest having a look at my source code on [github](https://github.com/munHunger/decals).

Lastly if you want to see it in action you can try it out [here](https://munhunger.github.io/decals/)
