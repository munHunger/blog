<script>
  import MeshGroup from './meshGroup.svelte'
  import { OrbitControls, T, Mesh, Canvas, DirectionalLight } from '@threlte/core'
  import { degToRad } from 'three/src/math/MathUtils'
  import { onMount } from 'svelte'

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
    ['wall:0', 'floor:0', 'floor:0', 'floor:0', 'floor:0', 'box:0', 'floor:0'],
    ['wall:0', 'box:0', 'floor:0', 'floor:0', 'floor:0', 'conveyor-open:0', 'floor:0'],
    ['door:0', 'floor:0', 'floor:0', 'floor:0', 'floor:0', 'conveyor:0', 'floor:0'],
    ['wall:0', 'floor:0', 'floor:0', 'floor:0', 'floor:0', 'conveyor-cover:0', 'floor:0'],
    ['wall:0', 'floor:0', 'floor:0', 'floor:0', 'floor:0', 'conveyor-open:0', 'floor:0'],
    ['port:0', 'floor:0', 'conveyor-start:1', 'conveyor:1', 'conveyor-open:1', 'conveyor-open:0', 'floor:0'],
    ['wall:0', 'floor:0', 'floor:0', 'floor:0', 'floor:0', 'floor:0', 'floor:0'],
    ['wall:0', 'conveyor-start:1', 'conveyor:1', 'conveyor:1', 'conveyor-cover:1', 'conveyor-open:1', 'box:0'],
    ['wall:0', 'floor:0', 'floor:0', 'floor:0', 'floor:0', 'floor:0', 'floor:0'],
    ['wall-corner:3', 'wall:3', 'wall:3', 'wall:3', 'wall:3', 'wall:3', 'wall:3']
  ]

  function unique(value, index, self) {
    return self.indexOf(value) === index
  }
  export let scene
  /**
   * @type {Array.<Array.<Array.<{type: string, odds: number}>>>}
   */
  export let solver

  let adjacencyCount = {}
  let rules = {}

  function reset() {
    scene = defaultScene.map(v => v.map(a => ({ type: 'empty', rot: 0 })))
    solver = defaultScene.map(v =>
      v.map(a => assets.map(v => new Array(4).fill(undefined).map((_, i) => ({ type: `${v}:${i}`, odds: 1 }))).flat())
    )
    adjacencyCount = {}

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
    rules = {}
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
  }

  reset()

  /**
   * @type {Array.<{x: number, y:number}>}
   */
  let placements = []

  function step() {
    do {
      updateAllowList()
    } while (solveForced() > 0)
  }
  function cloneScene() {
    return JSON.parse(JSON.stringify(scene))
  }
  function updateAllowList() {
    scene.forEach((col, x) =>
      col.forEach((entity, y) => {
        if (entity.type !== 'empty') return
        const allowList = assets
          .map(v => new Array(4).fill(undefined).map((_, i) => `${v}:${i}`))
          .flat()
          .map(type => {
            let sceneClone = cloneScene()
            sceneClone[x][y].type = type
            let odds = -1
            for (let xX = -1; xX <= 1; xX += 2) {
              if (x + xX >= 0 && x + xX < sceneClone.length) {
                let hRule = (rules[sceneClone[x + xX][y].type + ':' + sceneClone[x + xX][y].rot] || {}).horizontalRules
                if (hRule && hRule.map(v => v.entity).includes(type)) {
                  odds = Math.max(odds, hRule.find(v => v.entity === type).odds)
                } else if (hRule) {
                  //We have rules for the square but they do not include our asset, meaning it is not valid
                  odds = 0
                }
              }
            }
            for (let yY = -1; yY <= 1; yY += 2) {
              if (y + yY >= 0 && y + yY < sceneClone[x].length) {
                let vRule = (rules[sceneClone[x][y + yY].type + ':' + sceneClone[x][y + yY].rot] || {}).verticalRules
                if (vRule && vRule.map(v => v.entity).includes(type)) {
                  odds = odds === 0 ? 0 : Math.max(odds, vRule.find(v => v.entity === type).odds) //if the odds is zero then there is another entity invalidating it horizontally
                } else if (vRule) {
                  //We have rules for the square but they do not include our asset, meaning it is not valid
                  odds = 0
                }
              }
            }
            if (odds === -1) odds = 1 / assets.length
            return { odds, type }
          })
          .filter(v => v.odds > 0)
        if (allowList.length === 0) {
          throw `allow list is empty for ${x},${y}`
        }
        solver[x][y] = allowList
      })
    )
  }
  function solveForced() {
    let solvedCount = 0
    solver.forEach((col, x) =>
      col.forEach((cell, y) => {
        if (cell.length === 1 && scene[x][y].type == 'empty') {
          scene[x][y].type = cell[0].type.split(':')[0]
          scene[x][y].rot = parseInt(cell[0].type.split(':')[1])
          placements.push({ x, y })
          solvedCount++
        }
      })
    )
    return solvedCount
  }
  /**
   * stolen from https://dev.to/trekhleb/weighted-random-algorithm-in-javascript-1pdc
   * Picks the random item based on its weight.
   * The items with higher weight will be picked more often (with a higher probability).
   *
   * For example:
   * - items = ['banana', 'orange', 'apple']
   * - weights = [0, 0.2, 0.8]
   * - weightedRandom(items, weights) in 80% of cases will return 'apple', in 20% of cases will return
   * 'orange' and it will never return 'banana' (because probability of picking the banana is 0%)
   *
   * @param {any[]} items
   * @param {number[]} weights
   */
  function weightedRandom(items, weights) {
    if (items.length !== weights.length) {
      throw 'Items and weights must be of the same size'
    }

    if (!items.length) {
      throw 'Items must not be empty'
    }

    // Preparing the cumulative weights array.
    // For example:
    // - weights = [1, 4, 3]
    // - cumulativeWeights = [1, 5, 8]
    const cumulativeWeights = []
    for (let i = 0; i < weights.length; i += 1) {
      cumulativeWeights[i] = weights[i] + (cumulativeWeights[i - 1] || 0)
    }

    // Getting the random number in a range of [0...sum(weights)]
    // For example:
    // - weights = [1, 4, 3]
    // - maxCumulativeWeight = 8
    // - range for the random number is [0...8]
    const maxCumulativeWeight = cumulativeWeights[cumulativeWeights.length - 1]
    const randomNumber = maxCumulativeWeight * Math.random()

    // Picking the random item based on its weight.
    // The items with higher weight will be picked more often.
    for (let itemIndex = 0; itemIndex < items.length; itemIndex += 1) {
      if (cumulativeWeights[itemIndex] >= randomNumber) {
        return {
          item: items[itemIndex],
          index: itemIndex
        }
      }
    }
  }

  let errors = 0
  let lastFail = 0
  let backtrackLength = 1
  function populateOne() {
    try {
      if (!scene.find(col => col.find(e => e.type === 'empty'))) {
        console.log('board solved')
        return //already solved and no more empty exists
      }
      let x = Math.floor(Math.random() * scene.length)
      let y = Math.floor(Math.random() * scene[x].length)
      if (placements.length === 0) {
        console.log('first placement')
        scene[0][0] = { type: 'wall-corner', rot: 0 }
        placements.push({ x: 0, y: 0 })
        return populateOne()
      }
      step()
      if (placements.length > 0) {
        loop: for (x = 0; x < scene.length; x++) {
          for (y = 0; y < scene[x].length; y++) {
            if (scene[x][y].type === 'empty') {
              for (let xX = -1; xX <= 1; xX += 2) {
                if (x + xX >= 0 && x + xX < scene.length) {
                  if (scene[x + xX][y].type !== 'empty') break loop
                }
              }
              for (let yY = -1; yY <= 1; yY += 2) {
                if (y + yY >= 0 && y + yY < scene[x].length) {
                  if (scene[x][y + yY].type !== 'empty') break loop
                }
              }
            }
          }
        }
      }
      let options = solver[x][y]
      let option = weightedRandom(
        options,
        options.map(v => v.odds)
      )?.item
      scene[x][y].type = option.type.split(':')[0]
      scene[x][y].rot = option.type.split(':')[1]
      placements.push({ x, y })
      // setTimeout(populateOne, 100)
    } catch (err) {
      errors++
      if (errors > 500) {
        console.log('seems broken, will stop fully here')
        return
      }
      console.log('could not continue, resetting last ' + placements.length + ',' + lastFail)
      console.log(err)
      if (lastFail === placements.length) {
        console.log('failing at the same place')
        backtrackLength++
        if (backtrackLength > placements.length) {
          console.log('Doing a hard reset')
          return fullReset()
        }
      }
      for (let i = 0; i < backtrackLength; i++) {
        let last = placements.pop()
        if (last) scene[last.x][last.y].type = 'empty'
      }
      lastFail = placements.length
    }
    populateOne()
  }
  onMount(() => {
    populateOne()
  })

  function fullReset() {
    reset()
    backtrackLength = 1
    placements = []
    populateOne()
  }
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
          <MeshGroup type={entity.type} />
        </T.Group>
      {/each}
    {/each}
  </Canvas>
</div>

<button
  on:click={fullReset}
  class="swap-on btn btn-block btn-primary text-base font-normal normal-case transition-all duration-200">
  reset
</button>
