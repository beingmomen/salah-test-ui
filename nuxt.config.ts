// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },

  modules: [
    '@nuxt/ui',
    '@nuxt/eslint'
  ],

  css: ['~/assets/css/main.css'],

  future: {
    compatibilityVersion: 4
  },

  devServer: {
    port: 7000
  },

  runtimeConfig: {
    public: {
      baseURL: process.env.BASE_URL,
    },
  },

  compatibilityDate: '2024-11-27'
})