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