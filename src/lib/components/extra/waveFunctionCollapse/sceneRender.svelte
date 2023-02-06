<script>
  import MeshGroup from './meshGroup.svelte'
  import { OrbitControls, T, Mesh, Canvas, useLoader } from '@threlte/core'
  import { degToRad } from 'three/src/math/MathUtils'
  import { BoxGeometry, CircleGeometry, MeshPhongMaterial, MeshStandardMaterial, ShadowMaterial } from 'three'

  import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'
  import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js'
  import { onMount } from 'svelte'
  import { Box, Conveyor, ConveyorStart, Floor } from './entities'

  export let rules = {
    box: ctx => {
      if (checkHorizontal(ctx, 'conveyor') === 0 && checkHorizontal(ctx, 'interactive', 1) === 1) {
        return [
          [, ['conveyor']],
          [, ,],
          [, ['conveyor']]
        ]
      }
    },
    conveyor: ctx => {
      return [
        [, ['box', 'conveyor', 'conveyor-start']],
        [, ,],
        [, ['box', 'conveyor', 'conveyor-start']]
      ]
    },
    'conveyor-start': ctx => {
      return [
        [, ['conveyor']],
        [, ,],
        [, ['conveyor']]
      ]
    }
  }

  export let scene = [[{ type: 'floor' }], [{ type: 'box' }], [{ type: 'conveyor' }], [{ type: 'conveyor-start' }]]

  export let assets = ['box', 'conveyor', 'floor', 'conveyor-start']

  let solver = new Array(scene.length).fill(undefined).map(() => new Array(scene[0].length).fill(assets))

  export function populateOne() {
    let x = Math.floor(Math.random() * scene.length)
    let y = Math.floor(Math.random() * scene[x].length)
    if (scene[x][y].type === 'interactive') {
      scene[x][y].click({
        scene,
        entity: scene[x][y],
        x,
        y,
        asset: solver[x][y][Math.floor(Math.random() * solver[x][y].length)]
      })
      step()
    } else populateOne()
  }

  const fontLoader = useLoader(FontLoader, () => new FontLoader())
  let font
  onMount(() => {
    fontLoader.load('/assets/helvetiker_regular.typeface.json', f => {
      font = f
    })
  })
  function checkHorizontal(ctx, type, depth = 99) {
    let offset = 1
    let count = 0
    while (type.includes(((ctx.scene[ctx.x + offset] || [])[ctx.y] || {}).type) && offset <= depth) {
      count++
      offset++
    }
    offset = -1
    while (type.includes(((ctx.scene[ctx.x + offset] || [])[ctx.y] || {}).type) && -offset <= depth) {
      count++
      offset--
    }
    console.log(`checked for ${type} at ${ctx.x}:${ctx.y}, found ${count}`)
    return count
  }

  function step() {
    do {
      updateAllowList()
    } while (solveForced() > 0)
  }

  function cloneScene() {
    return JSON.parse(JSON.stringify(scene))
  }

  function updateAllowList() {
    console.log(`updating the allow list`)
    scene.forEach((col, x) =>
      col.forEach((entity, y) => {
        if (entity.type !== 'interactive') return
        const allowList = [new Box(x, y), new Floor(x, y), new Conveyor(x, y), new ConveyorStart(x, y)]
          .filter(type => {
            let sceneClone = cloneScene()
            sceneClone[x][y].type = type.name
            let valid = true
            for (let xX = 0; xX < sceneClone.length; xX++) {
              for (let yY = 0; yY < sceneClone[xX].length; yY++) {
                let active = [new Box(xX, yY), new Floor(xX, yY), new Conveyor(xX, yY), new ConveyorStart(xX, yY)].find(
                  v => v.name == sceneClone[xX][yY].type
                )
                if (active)
                  console.log(
                    `found an active tile ${active.name} that is invalid ${active.isInvalid(sceneClone)} assuming ${
                      type.name
                    } has been placed `
                  )
                if (active && active.isInvalid(sceneClone)) valid = false
              }
            }
            return valid
          })
          .map(v => v.name)
        solver[x][y] = assets.filter(v => allowList.includes(v))
        console.log(`${x},${y} now has ${solver[x][y].length} valid entries`)
      })
    )
  }

  let isSelecting
  function solveForced() {
    let solvedCount = 0
    solver.forEach((col, x) =>
      col.forEach((cell, y) => {
        if (cell.length === 1 && scene[x][y].type == 'interactive') {
          if (rules[cell[0]]) {
            rules[cell[0]].apply({}, [{ scene, x, y, checkHorizontal, updateAllowList }])
          }
          scene[x][y].click({ scene, entity: scene[x][y], x, y, asset: cell[0] })
          solvedCount++
        }
      })
    )
    console.log(`solved ${solvedCount} obvious cells`)
    return solvedCount
  }
</script>

<div class="h-96">
  <Canvas>
    <T.PerspectiveCamera makeDefault position={[0, 10, 10]} fov={24}>
      <OrbitControls maxPolarAngle={degToRad(80)} enableZoom={true} target={{ y: 0.5 }} />
    </T.PerspectiveCamera>

    <T.DirectionalLight castShadow position={[3, 10, 10]} />
    <T.DirectionalLight position={[-3, 10, -10]} intensity={0.2} />
    <T.AmbientLight intensity={0.2} />

    {#each scene as col, x}
      {#each col as entity, y}
        <T.Group position={[x - scene.length / 2, 0, y - col.length / 2]}>
          {#if entity.type === 'interactive'}
            <Mesh
              receiveShadow
              interactive
              rotation={{ x: degToRad(-90) }}
              material={new MeshStandardMaterial({ color: entity.hover ? '#333333' : '#aaaaaa', opacity: 0.1 })}
              geometry={new BoxGeometry(0.75, 0.75, 0.25)}
              on:pointerenter={() => (entity.hover = true)}
              on:pointerleave={() => (entity.hover = false)}
              on:click={() => (isSelecting = { x, y })} />

            {#if isSelecting && isSelecting.x === x && isSelecting.y === y}
              {#each solver[x][y] as asset, i}
                <T.Group position={[i - assets.length / 2 + 0.5, 0.5, 0]}>
                  <MeshGroup
                    on:click={() => {
                      console.log('asset clicked')
                      entity.click({ scene, entity, x, y, asset })
                      isSelecting = undefined
                      step()
                    }}
                    type={asset} />
                </T.Group>
              {/each}
            {/if}
            {#if font}
              <Mesh
                position={{ y: 0.2 }}
                geometry={new TextGeometry('' + solver[x][y].length, {
                  size: 0.3,
                  height: 0.1,
                  font
                })}
                material={new MeshStandardMaterial({ color: '#505050', opacity: 0.1 })} />
            {/if}
          {:else}
            <MeshGroup {...entity} />
          {/if}
        </T.Group>
      {/each}
    {/each}

    <Mesh
      receiveShadow
      interactive
      rotation={{ x: degToRad(-90) }}
      material={new ShadowMaterial()}
      geometry={new CircleGeometry(3, 72)} />
  </Canvas>
</div>
