import tailwindcss from "@tailwindcss/vite"

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: [
    '~/assets/css/main.css',
    '@vue-flow/core/dist/style.css',
    '@vue-flow/core/dist/theme-default.css',
  ],

  vite: {
    plugins: [tailwindcss()],
  },

  // Maak .env variabelen beschikbaar in de app
  runtimeConfig: {
    public: {
      entraTenantId: '',
      entraClientId: '',
      apiBaseUrl: '',
    },
  },

  modules: ['@nuxt/eslint'],
})