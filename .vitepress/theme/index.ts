// https://vitepress.dev/guide/custom-theme
import type { Theme } from 'vitepress';
import DefaultTheme from 'vitepress/theme';
import { h } from 'vue';
import Sponsors from './components/Sponsors.vue';
import HomePage from './components/HomePage.vue';
import './style.css';

export default {
  extends: DefaultTheme,
  Layout: () => {
    return h(DefaultTheme.Layout, null, {
      // https://vitepress.dev/guide/extending-default-theme#layout-slots
      'home-features-after': () => h(HomePage),
    });
  },
  enhanceApp({ app, router, siteData }) {
    app.component('Sponsors', Sponsors);
  },
} satisfies Theme;
