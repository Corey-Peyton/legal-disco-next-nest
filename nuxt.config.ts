import NuxtConfiguration from '@nuxt/config';
import VuetifyLoaderPlugin from 'vuetify-loader/lib/plugin';
import nodeExternals from 'webpack-node-externals';
const isDev = !(process.env.NODE_ENV === 'production');

const config: NuxtConfiguration = {
  mode: 'universal',

  env: {
    host: 'localhost',
    port: '3100',
    baseUrl: process.env.BASE_URL || 'http://localhost:3100',
  },

  srcDir: './client/',
  dev: isDev,

  /*
   ** Headers of the page
   */
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

  /*
   ** Customize the progress-bar color
   */
  loading: { color: '#3B8070' },

  /*
   ** Global CSS
   */
  css: ['element-ui/lib/theme-chalk/index.css', '~/assets/style/app.styl'],

  /*
   ** Plugins to load before mounting the App
   */
  plugins: ['@/plugins/element-ui', '@/plugins/vuetify', '@/plugins/axiosInstance.ts'],

  /*
   ** Nuxt.js modules
   */
  modules: [
    // Doc: https://axios.nuxtjs.org/usage
    '@nuxtjs/axios',
  ],
  /*
   ** Axios module configuration
   */
  axios: {
    // See https://github.com/nuxt-community/axios-module#options
    debug: isDev,
  },

  /*
   ** Build configuration
   */
  build: {
    cache: true,
    babel: {
      plugins: ['@babel/plugin-transform-modules-commonjs'],
    },
    transpile: ['vuetify/lib', /^element-ui/],
    plugins: [new VuetifyLoaderPlugin()],
    loaders: {
      stylus: {
        import: ['~assets/style/variables.styl'],
      },
    },
    /*
     ** You can extend webpack config here
     */
    extend(config, ctx) {
      if (process.server) {
        config.externals = [
          nodeExternals({
            whitelist: [/^vuetify/],
          }),
        ];
      }
    },
  },
};

export default config;
