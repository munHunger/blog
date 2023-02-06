<script>
  import { GLTF } from '@threlte/extras'
  import { createEventDispatcher } from 'svelte'

  const dispatch = createEventDispatcher()
  const getGLTFUrl = asset => `/assets/kenneyConveyor/GLTF/${asset}.glb`

  export let type
</script>

{#if type === 'floor'}
  <GLTF interactive on:click={() => dispatch('click')} receiveShadow url={getGLTFUrl('floor')} position={{ x: 0 }} />
{:else if type === 'conveyor'}
  <GLTF
    interactive
    on:click={() => dispatch('click')}
    castShadow
    receiveShadow
    url={getGLTFUrl('conveyor-bars-stripe-fence')}
    position={{ y: 1 }} />
  <GLTF
    interactive
    on:click={() => dispatch('click')}
    castShadow
    receiveShadow
    url={getGLTFUrl('structure-medium')}
    position={{ x: 0 }} />
  <GLTF interactive on:click={() => dispatch('click')} castShadow receiveShadow url={getGLTFUrl('floor')} position={{ x: 0 }} />
{:else if type === 'conveyor-start'}
  <GLTF
    interactive
    on:click={() => dispatch('click')}
    castShadow
    receiveShadow
    url={getGLTFUrl('cover-stripe-hopper')}
    position={{ y: 1 }} />
  <GLTF
    interactive
    on:click={() => dispatch('click')}
    castShadow
    receiveShadow
    url={getGLTFUrl('conveyor-bars')}
    position={{ y: 1 }} />
  <GLTF
    interactive
    on:click={() => dispatch('click')}
    castShadow
    receiveShadow
    url={getGLTFUrl('structure-medium')}
    position={{ x: 0 }} />
  <GLTF interactive on:click={() => dispatch('click')} castShadow receiveShadow url={getGLTFUrl('floor')} position={{ x: 0 }} />
{:else if type === 'conveyor-cover'}
  <GLTF
    interactive
    on:click={() => dispatch('click')}
    castShadow
    receiveShadow
    url={getGLTFUrl('cover-window')}
    position={{ y: 1 }} />
  <GLTF
    interactive
    on:click={() => dispatch('click')}
    castShadow
    receiveShadow
    url={getGLTFUrl('conveyor-bars')}
    position={{ y: 1 }} />
  <GLTF
    interactive
    on:click={() => dispatch('click')}
    castShadow
    receiveShadow
    url={getGLTFUrl('structure-medium')}
    position={{ x: 0 }} />
  <GLTF interactive on:click={() => dispatch('click')} castShadow receiveShadow url={getGLTFUrl('floor')} position={{ x: 0 }} />
{:else if type === 'conveyor-open'}
  <GLTF
    interactive
    on:click={() => dispatch('click')}
    castShadow
    receiveShadow
    url={getGLTFUrl('conveyor-bars-sides')}
    position={{ y: 1 }} />
  <GLTF
    interactive
    on:click={() => dispatch('click')}
    castShadow
    receiveShadow
    url={getGLTFUrl('conveyor-bars')}
    position={{ y: 1 }} />
  <GLTF
    interactive
    on:click={() => dispatch('click')}
    castShadow
    receiveShadow
    url={getGLTFUrl('structure-medium')}
    position={{ x: 0 }} />
  <GLTF interactive on:click={() => dispatch('click')} castShadow receiveShadow url={getGLTFUrl('floor')} position={{ x: 0 }} />
{:else if type === 'box'}
  <GLTF
    interactive
    on:click={() => dispatch('click')}
    castShadow
    receiveShadow
    url={getGLTFUrl('box-large')}
    position={{ x: 0 }} />
  <GLTF interactive on:click={() => dispatch('click')} castShadow receiveShadow url={getGLTFUrl('floor')} position={{ x: 0 }} />
{:else if type === 'wall'}
  <GLTF
    interactive
    on:click={() => dispatch('click')}
    castShadow
    receiveShadow
    url={getGLTFUrl('structure-wall')}
    position={{ x: 0 }} />
{:else if type === 'wall-corner'}
  <GLTF
    interactive
    on:click={() => dispatch('click')}
    castShadow
    receiveShadow
    url={getGLTFUrl('structure-wall')}
    position={{ x: 0 }} />
  <GLTF
    interactive
    on:click={() => dispatch('click')}
    castShadow
    receiveShadow
    url={getGLTFUrl('structure-wall')}
    position={{ x: 0 }}
    rotation={{ y: Math.PI / 2 }} />
{:else if type === 'door'}
  <GLTF
    interactive
    on:click={() => dispatch('click')}
    castShadow
    receiveShadow
    url={getGLTFUrl('structure-wall')}
    position={{ x: 0 }} />
  <GLTF
    interactive
    on:click={() => dispatch('click')}
    castShadow
    receiveShadow
    url={getGLTFUrl('door')}
    position={{ z: -0.45 }} />
{:else if type === 'port'}
  <GLTF
    interactive
    on:click={() => dispatch('click')}
    castShadow
    receiveShadow
    url={getGLTFUrl('structure-wall')}
    position={{ x: 0 }} />
  <GLTF
    interactive
    on:click={() => dispatch('click')}
    castShadow
    receiveShadow
    url={getGLTFUrl('door-wide-half')}
    scale={{ x: 0.5 }}
    position={{ z: -0 }} />
  <GLTF
    interactive
    on:click={() => dispatch('click')}
    castShadow
    receiveShadow
    url={getGLTFUrl('structure-doorway')}
    position={{ z: -0 }} />
{:else if type === 'empty'}
  <GLTF
    interactive
    on:click={() => dispatch('click')}
    castShadow
    receiveShadow
    url={getGLTFUrl('arrow')}
    rotation={{ z: -Math.PI / 2, y: -Math.PI / 2 }} />
{/if}
