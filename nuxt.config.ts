// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: [
    '@nuxt/eslint',
    '@nuxt/ui'
  ],

  css: ['~/assets/css/main.css'],

  buildDir: 'C:/temp/restoNextGen/.nuxt',

  // Use remote icons to avoid build path issues  
  icon: {
    serverBundle: 'remote'
  },

  // Customize Nuxt UI theme colors
  ui: {
    theme: {
      colors: ['amber', 'stone', 'success', 'info', 'warning', 'error']
    }
  }
})