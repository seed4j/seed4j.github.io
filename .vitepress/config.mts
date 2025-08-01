import { defineConfig } from 'vitepress';

// https://vitepress.dev/reference/site-config
export default defineConfig({
  base: '/',
  title: 'Seed4J',
  description: 'Modular code generator with clean architecture',
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Examples', link: '/markdown-examples' },
    ],

    sidebar: [
      {
        text: 'Examples',
        items: [
          { text: 'Markdown Examples', link: '/markdown-examples' },
          { text: 'Runtime API Examples', link: '/api-examples' },
        ],
      },
    ],

    socialLinks: [
      { icon: 'linkedin', link: 'https://www.linkedin.com/company/seed4j' },
      { icon: 'x', link: 'https://x.com/seed4j' },
      { icon: 'github', link: 'https://github.com/seed4j/seed4j' }
    ],
  },
});
