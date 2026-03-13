// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  // Maak .env variabelen beschikbaar in de app
  runtimeConfig: {
    public: {
      // De waarde achter de apiBaseUrl wordt overschreven door de .env als die aanwezig is.
      apiBaseUrl: 'http://localhost:8000',
    },
  },

  modules: [
      '@nuxt/eslint'
  ]
})