<script>
  import SceneRender from './sceneRender.svelte'
  /**
   * @type {SceneRender}
   */
  let sceneRenderer

  function step() {
    sceneRenderer.populateOne()
  }
</script>

<SceneRender
  bind:this={sceneRenderer}
  scene={new Array(6)
    .fill(undefined)
    .map(() =>
      new Array(6).fill(undefined).map(() => ({ type: 'interactive', click: ctx => (ctx.entity.type = ctx.asset) }))
    )} />

<button on:click={step} class="swap-on btn btn-block btn-primary text-base font-normal normal-case transition-all duration-200">
  step
</button>
