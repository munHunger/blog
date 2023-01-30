<script lang="ts">
  import * as THREE from 'three'
  import { STLLoader } from 'three/examples/jsm/loaders/STLLoader'
  import { onMount } from 'svelte'

  function addLightsToScene(scene: any) {
    const hemiLight = new THREE.HemisphereLight()
    hemiLight.intensity = 0.35
    scene.add(hemiLight)

    const dirLight = new THREE.DirectionalLight()
    dirLight.position.set(5, 5, 5)
    dirLight.castShadow = true
    dirLight.shadow.camera.zoom = 2
    scene.add(dirLight)
  }

  function loadGeometry(scene: any) {
    const material = new THREE.MeshMatcapMaterial({
      color: 0xd9d7d2
    })

    const loader = new STLLoader()
    loader.load(
      '/assets/d20.stl',
      function (geometry: any) {
        const mesh = new THREE.Mesh(geometry, material)
        scene.add(mesh)
        function animate() {
          requestAnimationFrame(animate)

          mesh.rotation.x += 0.01
          mesh.rotation.y += 0.01
        }

        animate()
      },
      (xhr: any) => {
        console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
      },
      (error: any) => {
        console.log(error)
      }
    )
  }

  onMount(() => {
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)

    const renderer = new THREE.WebGLRenderer()
    renderer.setSize(300, 300)

    container.appendChild(renderer.domElement)

    addLightsToScene(scene)
    loadGeometry(scene)
    camera.position.z = 5

    function animate() {
      requestAnimationFrame(animate)
      renderer.render(scene, camera)
    }

    animate()
  })
  let container: HTMLDivElement
</script>

<div bind:this={container} />
