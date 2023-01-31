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
