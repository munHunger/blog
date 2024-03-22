---
title: 'Rounding in firefox and chromium'
image: '/blog/threejs/2/header.jpg'
summary: Rounding errors for three js in chromium vs firefox
created: 2024-03-22
tags:
  - 'three js'
  - 'firefox'
  - 'chromium'
---

I encountered an interesting bug today that I thought to write about.

This bug relates to ThreeJS and as a 3D framework it of course handles matrixes, and float values.
The fact that I explicitly say float values, might tick you of that this bug relates to a rounding error, and you would be correct in thinking so.

Imagine setting the position and rotation of a mesh.
```
const test = new THREE.Mesh(new THREE.PlaneGeometry(), new THREE.MeshBasicMaterial());
test.position.copy(new THREE.Vector3(-0.0800582263098657,0,-0.003907569688712309))
test.rotation.copy(new THREE.Euler(-1.5707963267948966,0,0, "XYZ"))
```

Nothing out of the ordinary, and since we are making it easy for us we aren't manually doing anything with the meshes matrix, and let threeJS do that for us on the next render cycle.
And this will likely work! at least it did for me. But it turns out that it only worked for me because I am running a chromium based browser, which runs the V8 js engine.
When I tried my code in firefox, running SpiderMonkey, everything was renderer upside down because of a rounding error. Or rather, everything that I projected using a raycast was renderer upside down.

What is more interesting (in my opinion) is that the rounding error is really small, and the diff between V8 and SpiderMonkey came down to about `4e-16` in a cell in the meshes matrix. 
But `4e-16` can be enough to flip a sign from plus to minus, which it did in my case, resulting in the raycast getting flipped.

## So can we fix it?

I made my own solution to this, and it is not pretty, but it works.
```ts
private setMatrixPrecisionOnMesh(mesh: THREE.Object3D) {
    const update = mesh.updateMatrix;
    mesh.updateMatrix = function updateMatrix() {
        const precision = 10000000
        const round = (num) => Math.round(num * precision) / precision;
        this.position.setX(round(this.position.x));
        this.position.setY(round(this.position.y));
        this.position.setZ(round(this.position.z));
        this.rotation.set(
            round(this.rotation.x),
            round(this.rotation.y),
            round(this.rotation.z),
            this.rotation.order
        )
        update.call(this, {});
    }
}
```
Using that method I get numbers that aren't as precise as before, but I get rid of all rounding differences between firefox and chromium.