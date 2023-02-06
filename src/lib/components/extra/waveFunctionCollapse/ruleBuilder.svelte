<script>
  import MeshGroup from './meshGroup.svelte'
  import { OrbitControls, T, Mesh, Canvas, DirectionalLight } from '@threlte/core'
  import { degToRad } from 'three/src/math/MathUtils'
  import { BoxGeometry, CircleGeometry, MeshStandardMaterial, ShadowMaterial } from 'three'

  export let assets = [
    'wall-corner',
    'wall',
    'box',
    'conveyor',
    'floor',
    'conveyor-start',
    'door',
    'port',
    'conveyor-cover',
    'conveyor-open'
  ]
  export let defaultScene = [
    ['wall-corner:0', 'wall:1', 'wall:1', 'door:1', 'wall:1', 'wall:1', 'wall:1'],
    ['wall:0', 'floor', 'floor', 'floor', 'floor', 'box', 'floor'],
    ['wall:0', 'box', 'floor', 'floor', 'floor', 'conveyor-open', 'floor'],
    ['door:0', 'floor', 'floor', 'floor', 'floor', 'conveyor', 'floor'],
    ['wall:0', 'floor', 'floor', 'floor', 'floor', 'conveyor-cover', 'floor'],
    ['wall:0', 'floor', 'floor:0', 'floor:0', 'floor:0', 'conveyor-open:0', 'floor'],
    ['port:0', 'floor', 'conveyor-start:1', 'conveyor:1', 'conveyor-open:1', 'conveyor-open:0', 'floor'],
    ['wall:0', 'floor', 'floor', 'floor', 'floor', 'floor', 'floor'],
    ['wall:0', 'conveyor-start:1', 'conveyor:1', 'conveyor:1', 'conveyor-cover:1', 'conveyor-open:1', 'box'],
    ['wall:0', 'floor', 'floor', 'floor', 'floor', 'floor', 'floor'],
    ['wall-corner:3', 'wall:3', 'wall:3', 'wall:3', 'wall:3', 'wall:3', 'wall:3']
  ]

  function unique(value, index, self) {
    return self.indexOf(value) === index
  }
  export let scene = defaultScene.map(v => v.map(a => ({ type: a.split(':')[0], rot: a.split(':')[1] })))
  let adjacencyCount = {}

  /**
   * Take the default scene and map it into a list of unique assets
   * Have each asset represent a list of all other unique assets with a horizontal and vertical count
   */
  defaultScene
    .flat()
    .filter(unique)
    .forEach(asset => {
      adjacencyCount[asset] = {}
      defaultScene
        .flat()
        .filter(unique)
        .forEach(other => (adjacencyCount[asset][other] = { horizontal: 0, vertical: 0 }))
    })

  for (let x = 0; x < defaultScene.length; x++) {
    for (let y = 0; y < defaultScene[x].length; y++) {
      // we will only use manhattan adjacency so diagonals are irrelevant
      for (let xX = -1; xX <= 1; xX += 2) {
        if (x + xX >= 0 && x + xX < defaultScene.length)
          adjacencyCount[defaultScene[x][y]][defaultScene[x + xX][y]].horizontal++
      }
      for (let yY = -1; yY <= 1; yY += 2) {
        if (y + yY >= 0 && y + yY < defaultScene[x].length)
          adjacencyCount[defaultScene[x][y]][defaultScene[x][y + yY]].vertical++
      }
    }
  }
  let rules = {}
  Object.keys(adjacencyCount).forEach(entityKey => {
    let entity = adjacencyCount[entityKey]
    // figure out the statistical probability of there being an x horizontally adjacent
    let totalHorizontal = Object.values(entity)
      .map(v => v.horizontal)
      .reduce((acc, val) => acc + val, 0)
    let horizontalRules = Object.keys(entity)
      .map(v => ({
        entity: v,
        odds: entity[v].horizontal / totalHorizontal
      }))
      .filter(v => v.odds > 0)

    let totalVertical = Object.values(entity)
      .map(v => v.vertical)
      .reduce((acc, val) => acc + val, 0)
    let verticalRules = Object.keys(entity)
      .map(v => ({
        entity: v,
        odds: entity[v].vertical / totalVertical
      }))
      .filter(v => v.odds > 0)

    rules[entityKey] = { horizontalRules, verticalRules }
  })
</script>

<div class="h-96">
  <Canvas>
    <T.PerspectiveCamera makeDefault position={[0, 15, 15]} fov={24}>
      <OrbitControls maxPolarAngle={degToRad(80)} enableZoom={true} target={{ y: 0.5 }} />
    </T.PerspectiveCamera>

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
      intensity={1}
      target={{ x: 1 }}
      position={{ x: 3, y: 10, z: 10 }} />
    <DirectionalLight position={{ x: -3, y: 10, z: -10 }} intensity={0.3} />
    <T.AmbientLight intensity={0.2} />

    {#each scene as col, x}
      {#each col as entity, y}
        <T.Group position={[x - scene.length / 2, 0, y - col.length / 2]} rotation={[0, degToRad(90 * (entity.rot || 0)), 0]}>
          <MeshGroup {...entity} />
        </T.Group>
      {/each}
    {/each}
  </Canvas>
</div>
