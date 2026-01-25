// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },

  modules: ["@nuxt/eslint", "@nuxt/ui", "nuxt-auth-utils"],

  css: ["~/assets/css/main.css"],

  vite: {
    server: {
      watch: {
        usePolling: false,
        useFsEvents: false,
      },
    },
  },

  // Use remote icons to avoid build path issues
  icon: {
    serverBundle: "remote",
  },

  // Customize Nuxt UI theme colors
  ui: {
    theme: {
      colors: [
        "primary",
        "secondary",
        "neutral",
        "success",
        "info",
        "warning",
        "error",
      ],
    },
  },
});
