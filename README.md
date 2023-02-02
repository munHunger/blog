<br />
<div align="center">
<a href="https://github.com/importantimport/urara">
<img src="https://github.com/importantimport/urara/raw/main/urara/hello-world/urara.webp" alt="urara" /></a>
</div>
<br />

My personal blog "brand"

### Local

```bash
npx degit importantimport/urara my-blog && cd my-blog # create a new project in my-blog
pnpm i # if u don't have pnpm installed, run: npm i -g pnpm
```
## ⚡️ Usage

### Developing

Start a development server:

```bash
pnpm dev
```

### Building

Create a production version of ur blog:

```bash
pnpm build
```

u can preview the built app with `pnpm preview`.

### Documentation

For full documentation, visit [urara-docs.netlify.app](https://urara-docs.netlify.app).

### Give this project a star

tyvm! ur ⭐ will give me more motivation to improve this project.

## ✨ Features

- Out of the box **Atom feed** (WebSub), **Sitemap**, **PWA** (Web app manifest & ServiceWorker) support.
- Present beautiful interface designs and animations with daisyUI, of course.
- Good [IndieWeb](https://indieweb.org/) Compatibility - Multi-kind posts with [microformats2](https://microformats.org/) markup content, Showcasing [Webmentions](https://indieweb.org/Webmention) via [webmentions.io](https://webmentions.io) API.
- Don't worry about the article and image directories - just put them under a folder and they'll be [copied automatically at build time](https://github.com/importantimport/urara/blob/main/urara.ts).
- [Comment Components](https://github.com/importantimport/urara/tree/main/src/lib/components/comments): Webmentions, Giscus, Utterances... u can use more than one.

## 📦️ Pre-packed

### TailwindCSS & PostCSS Plugins

- [daisyUI](https://github.com/saadeghi/daisyui) - The most popular, free and open-source Tailwind CSS component library.
- [Tailwind CSS Typography](https://github.com/tailwindlabs/tailwindcss-typography) - Beautiful typographic defaults for HTML you don't control.
- [Autoprefixer](https://github.com/postcss/autoprefixer) - Parse CSS and add vendor prefixes to rules by Can I Use.
- [CSSNANO](https://github.com/cssnano/cssnano) - A modular minifier, built on top of the PostCSS ecosystem.

### Markdown preprocessor & Syntax highlighter

- [MDsveX](https://github.com/pngwn/MDsveX) - A markdown preprocessor for Svelte.
- [Shiki Twoslash](https://github.com/shikijs/twoslash) - A beautiful Syntax Highlighter.

### Vite Plugins

- [UnoCSS](https://github.com/unocss/unocss) - The instant on-demand atomic CSS engine.
- [VitePWA](https://github.com/antfu/vite-plugin-pwa) - Zero-config PWA for Vite.

## 🚀 Sites

- [./kwaa.dev](https://kwaa.dev) - [kwaa/blog](https://github.com/kwaa/blog)
- [Seviche.cc](https://seviche.cc) - [Sevichecc/Urara-Blog](https://github.com/Sevichecc/Urara-Blog)
- [Antonio Sarcevic](https://www.sarcevic.dev) - [SarcevicAntonio/SarcevicAntonio](https://github.com/SarcevicAntonio/SarcevicAntonio)

and more...

- [urara-blog - Discussions](https://github.com/importantimport/urara/discussions/2)
- [urara-blog - Topics](https://github.com/topics/urara-blog)

are u using Urara? add the `urara-blog` topic on ur repo!


## 📝 License

This work is free, it comes without any warranty. You can redistribute it and/or modify it under the
terms of the Do What The Fuck You Want To Public License, Version 2,
as published by Sam Hocevar. See the [COPYING](https://github.com/importantimport/urara/blob/main/COPYING) file for more details.

[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fimportantimport%2Furara.svg?type=large)](https://app.fossa.com/projects/git%2Bgithub.com%2Fimportantimport%2Furara?ref=badge_large)

special thanks / inspired from:

- [@michaeloliverx - Generate Posts List](https://github.com/pngwn/MDsveX/issues/294#issuecomment-907029639)
- icon made by [Kpouri](https://github.com/kpouri)
