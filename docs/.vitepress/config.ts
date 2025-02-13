import { defineConfig } from "vitepress";

export default defineConfig({
  title: "Folie",
  description: "Don't build from scratch",
  cleanUrls: true,
  metaChunk: true,

  sitemap: {
    hostname: "https://folie-suite.vercel.app"
  },

  head: [
    [
      'script',
      {
        async: "true",
        src: 'https://www.googletagmanager.com/gtag/js?id=G-VDPFZGXMX3',
      },
    ],
    [
      'script',
      {},
      "window.dataLayer = window.dataLayer || [];\nfunction gtag(){dataLayer.push(arguments);}\ngtag('js', new Date());\ngtag('config', 'G-VDPFZGXMX3');",
    ],
  ],

  themeConfig: {

    search: {
      provider: "local"
    },

    // nav: [
    //   { text: "Home", link: "/" },
    //   { text: "Guide", link: "/" },
    // ],

    sidebar: [
      {
        text: "Introduction",
        collapsed: false,
        items: [{ text: "What is Filante?", link: "/" }],
      },
      {
        text: "Packages",
        collapsed: false,
        items: [
          {
            text: "Cobalt",
            link: "/packages/cobalt/",
            collapsed: false,
            items: [
              { text: "Animation", link: "/packages/cobalt/animation/" },
            ],
          },
          { text: "Castle", link: "/packages/castle/" },
          { text: "Dishook", link: "/packages/dishook/" },
          { text: "Blueprint", link: "/packages/blueprint/" },
          { text: "Squid", link: "/packages/squid/" },
          { text: "Gate", link: "/packages/gate/" },
          { text: "CLI", link: "/packages/cli/" },
        ],
      },
    ],

    socialLinks: [],
  },
});
