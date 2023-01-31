// sveltekit config type
import type { Config } from '@sveltejs/kit'
// svelte adapter
import adapterAuto from '@sveltejs/adapter-auto'
import adapterNode from '@sveltejs/adapter-node'
import preprocess from 'svelte-preprocess';
import seqPreprocessor from 'svelte-sequential-preprocessor'
import { preprocessThrelte } from '@threlte/preprocess'
import adapterStatic from '@sveltejs/adapter-static'
// svelte preprocessor
import { mdsvex } from 'mdsvex'
import mdsvexConfig from './mdsvex.config.js'
import importAssets from 'svelte-preprocess-import-assets'
import { vitePreprocess } from '@sveltejs/kit/vite'

const defineConfig = (config: Config) => config

export default defineConfig({
  extensions: ['.svelte', ...(mdsvexConfig.extensions as string[])],
  preprocess: [mdsvex(mdsvexConfig), importAssets(), vitePreprocess(), preprocess(), preprocessThrelte()],
  kit: {
    adapter: Object.keys(process.env).some(key => ['VERCEL', 'NETLIFY'].includes(key))
      ? adapterAuto()
      : process.env.ADAPTER === 'node'
      ? adapterNode({ out: 'build' })
      : adapterStatic({
          pages: 'build',
          assets: 'build',
          fallback: undefined
        }),
    prerender: {
      handleMissingId: 'warn'
    },
    csp: { mode: 'auto' }
  }
})
