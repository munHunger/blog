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
      d20Mesh.computeVertexNormals()
      d20Mesh.normalizeNormals()
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
