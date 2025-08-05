import { defineConfig } from 'vitepress';

// https://vitepress.dev/reference/site-config
export default defineConfig({
  base: '/',
  title: 'Seed4J',
  description: 'Modular code generator with clean architecture',
  themeConfig: {
    logo: '/favicon.svg',
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/docs/guide/getting-started' },
      { text: 'Use Cases', link: '/docs/use-cases/list' },
    ],
    sidebar: [
      {
        text: 'Introduction',
        items: [
          { text: 'Why Seed4J', link: '/docs/guide/why-seed4j' },
          { text: 'Getting Started', link: '/docs/guide/getting-started' },
        ],
      },
      {
        text: 'Use cases',
        items: [
          { text: 'List', link: '/docs/use-cases/list' },
          { text: 'Minimal project', link: '/docs/use-cases/minimal-project' },
          { text: 'Java Kata', link: '/docs/use-cases/java-kata' },
          { text: 'TypeScript Kata', link: '/docs/use-cases/ts-kata' },
          { text: 'Java backend project', link: '/docs/use-cases/java-backend' },
        ],
      },
    ],

    socialLinks: [
      { icon: 'linkedin', link: 'https://www.linkedin.com/company/seed4j' },
      { icon: 'x', link: 'https://x.com/seed4j' },
      { icon: 'github', link: 'https://github.com/seed4j/seed4j' },
    ],
  },
  ignoreDeadLinks: [/^http:\/\/localhost/],
  head: [
    ['link', { rel: 'icon', href: '/favicon.svg' }],
    ['script', { src: 'https://www.googletagmanager.com/gtag/js?id=G-DR0S8XWFFC', async: '' }],
    [
      'script',
      {},
      `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-DR0S8XWFFC');
    `,
    ],
    [
      'script',
      { type: 'application/ld+json' },
      JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Organization',
        url: 'https://seed4j.com',
        logo: 'https://seed4j.com/seed4j_logo.png',
        name: 'Seed4J',
      }),
    ],
  ],
});
