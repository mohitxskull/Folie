import { defineConfig } from "vitepress";

export default defineConfig({
  title: "Folie",
  description: "Don't build from scratch",
  cleanUrls: true,
  metaChunk: true,

  sitemap: {
    hostname: "https://folie.mohitxskull.com"
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
        items: [{ text: "What is Folie?", link: "/" }],
      },
      {
        text: "Packages",
        collapsed: false,
        items: [
          { text: "Castle", link: "/packages/castle/",
            items: [
              { text: "Session Manager", link: "/packages/castle/session-manager/" },
              { text: "Model Cache", link: "/packages/castle/model-cache/" },
              { text: "Middleware", link: "/packages/castle/middleware/" },
              { text: "Providers", link: "/packages/castle/providers/" },
            ]
          },
          { text: "Squid", link: "/packages/squid" },
          { text: "Captcha", link: "/packages/captcha" },
        ],
      },
    ],

    socialLinks: [{
      icon: "github",
      link: "https://github.com/mohitxskull/folie"
    }],
  },
});
