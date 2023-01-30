<script lang="ts">
  import * as THREE from 'three' 
  import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js';
  import * as CANNON from 'cannon-es'
  import { STLLoader } from 'three/examples/jsm/loaders/STLLoader'
  import { onMount } from 'svelte'

  class Loader {
    models: [key: THREE.Geometry] = {}
    loader: any
    constructor() {
      this.loader = new STLLoader()
    }

    async getModel(name: string) {
      if (this.models[name]) return this.models[name]

      this.models[name] = new Promise((resolve, reject) => {
        this.loader.load(
          name,
          (geometry: any) => {
            console.log(geometry)
            geometry = BufferGeometryUtils.mergeVertices(geometry, 0.1)
            // this.models[name] = new THREE.Geometry().fromBufferGeometry(geometry)
            this.models[name] = geometry
            // this.models[name].mergeVertices()
            this.models[name].computeVertexNormals()
            
            resolve(this.models[name])
          },
          (xhr: any) => {
            console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
          },
          (error: any) => {
            console.log(error)
          }
        )
      })
      return this.models[name]
    }
  }

  const loader = new Loader()

  let counter = 0
  class Dice {
    mesh: THREE.Mesh
    body: CANNON.Body

    isReady: Promise<Dice>

    constructor() {
      const diceMaterial = new THREE.MeshPhongMaterial({
        color: 0x404040
      })

      this.isReady = new Promise(async (resolve, reject) => {
        let geo = await loader.getModel('/assets/d20.stl')
        this.mesh = new THREE.Mesh(geo, diceMaterial)
        this.mesh.castShadow = true
        console.log('loaded d20 model')
        this.body = createConvexHull(this.mesh)
        this.throwDice()
        resolve(this)
      })
    }
    throwDice() {
      this.body.position.set((counter++ % 3) * 2, Math.random(), Math.random() * 5 + 0.5)
      const shakeStrength = 10
      this.body.angularVelocity.set(Math.random() * shakeStrength, Math.random() * shakeStrength, Math.random() * shakeStrength)
      const angularStrength = 10
      const throwStrength = 8
      const throwBase = 3
      this.body.velocity.set(
        Math.random() * angularStrength - angularStrength / 2,
        0,
        -(Math.random() * throwStrength + throwBase)
      )
      this.body.angularDamping = 0.5
    }
    stepPhysics() {
      if (this.mesh.position && this.body.position) this.mesh.position.copy(this.body.position)
      if (this.mesh.quaternion && this.body.quaternion) this.mesh.quaternion.copy(this.body.quaternion)
    }
  }

  function createConvexHull(mesh: THREE.Mesh) {
    const position = mesh.geometry.attributes.position.array
    const points: CANNON.Vec3[] = []
    const faces: number[][] = []
    for (let i = 0; i < position.length; i += 3) {
      points.push(new CANNON.Vec3(position[i], position[i + 1], position[i + 2]))
    }
    for (let i = 0; i < position.length / 3; i += 3) {
      faces.push([i, i + 1, i + 2])
    }
    console.log({
      vertices: points,
      vl: points.length,
      faces: faces,
      fl: faces.length
    })
    const convexGeometry = new CANNON.ConvexPolyhedron({
      vertices: points,
      faces: faces
    })
    const body = new CANNON.Body({ mass: 1 })
    body.addShape(convexGeometry)
    return body
  }

  function addLightsToScene(scene: any) {
    const hemiLight = new THREE.HemisphereLight()
    hemiLight.intensity = 0.35
    scene.add(hemiLight)

    const dirLight = new THREE.DirectionalLight()
    dirLight.position.set(5, 5, 5)
    dirLight.castShadow = true
    dirLight.shadow.camera.zoom = 0.75
    dirLight.shadow.mapSize.width = 1024
    dirLight.shadow.mapSize.height = 1024
    dirLight.shadow.camera.near = 0.5
    dirLight.shadow.camera.far = 20
    scene.add(dirLight)
  }

  function loadWorld(scene: any) {
    const groundMaterial = new THREE.MeshPhongMaterial({
      color: 0xd9d7d2
    })

    const planeGeometry = new THREE.PlaneGeometry(25, 25)
    const planeMesh = new THREE.Mesh(planeGeometry, groundMaterial)
    planeMesh.rotateX(-Math.PI / 2)
    planeMesh.receiveShadow = true
    scene.add(planeMesh)
  }

  function animate() {
    requestAnimationFrame(animate)
    updatePhysics()
    render()
  }

  let world: CANNON.World
  let timeStep = 1 / 60
  let renderer: THREE.Renderer
  let scene: THREE.Scene
  let camera: THREE.Camera

  function updatePhysics() {
    // Step the physics world
    world.step(timeStep)

    dice.forEach(d => d.stepPhysics())
  }

  function render() {
    renderer.render(scene, camera)
  }

  function initCannon() {
    world = new CANNON.World()
    world.gravity.set(0, -9.82, 0)

    // Tweak contact properties.
    // Contact stiffness - use to make softer/harder contacts
    world.defaultContactMaterial.contactEquationStiffness = 1e6

    // Stabilization time in number of timesteps
    world.defaultContactMaterial.contactEquationRelaxation = 10
    world.solver.tolerance = 0.001
    world.quatNormalizeSkip = true
    world.quatNormalizeFast = true
    world.solver.iterations = 5
    world.broadphase = new CANNON.NaiveBroadphase()
    const planeShape = new CANNON.Plane()
    const planeBody = new CANNON.Body({ mass: 0 })
    planeBody.addShape(planeShape)
    planeBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2)
    world.addBody(planeBody)
  }

  onMount(async () => {
    await loader.getModel('/assets/d20.stl') //pre load model
    dice = new Array(2).fill(undefined).map(() => new Dice())
    initCannon()
    scene = new THREE.Scene()
    scene.add(new THREE.AxesHelper(5))
    camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000)

    renderer = new THREE.WebGLRenderer()
    renderer.setSize(300, 300)
    renderer.shadowMap.enabled = true

    container.appendChild(renderer.domElement)

    addLightsToScene(scene)
    loadWorld(scene)

    let d = await Promise.all(dice.map(d => d.isReady))

    d.forEach(d => {
      world.addBody(d.body)
      scene.add(d.mesh)
    })
    camera.position.set(0, 8, 1)

    camera.lookAt(0, 0, 1)
    animate()
  })
  let container: HTMLDivElement

  let dice: Dice[] = []
</script>

<div bind:this={container} on:click={() => dice.forEach(d => d.throwDice())} />
