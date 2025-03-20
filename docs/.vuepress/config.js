import { defaultTheme } from '@vuepress/theme-default'
import { defineUserConfig } from 'vuepress/cli'
import { viteBundler } from '@vuepress/bundler-vite'
import { mdEnhancePlugin } from "vuepress-plugin-md-enhance"
import { redirectPlugin } from '@vuepress/plugin-redirect'
import { docsearchPlugin } from '@vuepress/plugin-docsearch'
import { sidebarConfig } from './sidebar.js'
import { removeHtmlExtensionPlugin } from 'vuepress-plugin-remove-html-extension'
import { seoPlugin } from '@vuepress/plugin-seo'

export default defineUserConfig({
  lang: 'en-US',
  title: 'Hypervel',
  description: 'A Laravel-Style PHP Framework for Web Artisans.',

  ignoreDeadLinks: true,
  bundler: viteBundler(),

  plugins: [
    seoPlugin({
      hostname: 'https://hypervel.org',
      fallBackImage: '/home.png',
      ogp: (ogp, page) => ({
        ...ogp,
        'og:title': 'Hypervel - A Laravel-Style PHP Framework For Web Artisans',
        'og:description': "Hypervel is a Laravel-style framework with native coroutine support for ultra-high performance.",
      }),
    }),
    removeHtmlExtensionPlugin(),
    mdEnhancePlugin({
      hint: true,
      tasklist: true,
      include: true,
      tabs: true,
      align: true,
      chart: true,
    }),
    redirectPlugin({
        config: {
          '/docs': '/docs/introduction.html',
        },
    }),
    docsearchPlugin({
      appId: 'VH8TNYFP5F',
      apiKey: '434aa2025192c8d2fb19499cb78e5d48',
      indexName: 'hypervel'
    }),
  ],

  theme: defaultTheme({
    logo: 'icon.svg',

    docsRepo: 'hypervel/hypervel.org',

    docsBranch: 'main/docs',

    navbar: [
      '/',
      {
        text: 'Documentation',
        link: '/docs/introduction',
      },
      {
        text: 'GitHub',
        link: 'https://github.com/hypervel/hypervel',
      }
    ],

    sidebar: sidebarConfig,

    sidebarDepth: 0,
  }),
})
