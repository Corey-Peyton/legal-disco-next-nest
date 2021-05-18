import { NuxtConfig } from '@nuxt/types';
//import VuetifyLoaderPlugin from 'vuetify-loader/lib/plugin';
const isDev = !(process.env.NODE_ENV === 'production');

const config: NuxtConfig = {
  ssr: false, // Disable Server Side rendering

  env: {
    host: 'localhost',
    port: '3100',
    baseUrl: process.env.BASE_URL || 'http://localhost:3100',
  },

  telemetry: false, // True asks every time whether we want to participate for anonymous usage data.

  srcDir: './client/',

  dev: isDev,

  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    title: 'title',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: 'description' },
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      {
        rel: 'stylesheet',
        href:
          'https://fonts.googleapis.com/css?family=Roboto:300,400,500,700|Material+Icons',
      },
    ],
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [
    'element-ui/lib/theme-chalk/index.css',
    'splitpanes/dist/splitpanes.css',
    '@/styles/dark-theme.scss',
    'element-theme-dark',
    '@/styles/ecdisco-standard.scss',
    '@/styles/ecdisco-standard-nuxt-specific.scss',
  ],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: ['@/plugins/element-ui', '@/plugins/axiosInstance.ts'],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    // https://go.nuxtjs.dev/typescript
    '@nuxt/typescript-build',
    // https://go.nuxtjs.dev/stylelint
    '@nuxtjs/stylelint-module',
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    // https://go.nuxtjs.dev/axios
    '@nuxtjs/axios',
    // https://go.nuxtjs.dev/pwa
    '@nuxtjs/pwa',
    // https://go.nuxtjs.dev/content
    '@nuxt/content',
  ],

  // Axios module configuration: https://go.nuxtjs.dev/config-axios
  axios: {
    // See https://github.com/nuxt-community/axios-module#options
    debug: isDev,
  },

  // Content module configuration: https://go.nuxtjs.dev/config-content
  content: {},

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
    transpile: [/^element-ui/],
  },
};

export default config;
