import type { SiteConfig } from '$lib/types/site'

export const site: SiteConfig = {
  protocol: import.meta.env.URARA_SITE_PROTOCOL ?? 'https://',
  domain: import.meta.env.URARA_SITE_DOMAIN ?? 'blog.wunderdev.com',
  title: 'Wunderdev',
  subtitle: 'A personal blog about my hobby projects',
  lang: 'en-US',
  description: 'Powered by SvelteKit/Urara',
  author: {
    avatar: '/assets/profile.jpg',
    name: 'Marcus Münger',
    status: '🌸',
    bio: 'Exploring the world one commit at a time'
  },
  themeColor: '#3D4451'
}
