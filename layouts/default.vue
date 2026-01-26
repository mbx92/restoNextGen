<script setup lang="ts">
// Default layout for public pages

// Get theme from global state (set by tenant landing page)
const themeConfig = useState<{
  primaryColor?: string;
  secondaryColor?: string;
} | null>("themeConfig");

// Apply theme CSS variables if available
watchEffect(() => {
  if (themeConfig.value) {
    useHead({
      style: [
        {
          innerHTML: `
            :root {
              --primary-color: ${themeConfig.value.primaryColor || "#d97706"} !important;
              --secondary-color: ${themeConfig.value.secondaryColor || "#92400e"} !important;
            }
          `,
        },
      ],
    });
  }
});
</script>

<template>
  <div
    class="min-h-screen bg-stone-50 font-sans text-stone-800 selection:bg-amber-100 selection:text-amber-900"
  >
    <!-- Header -->
    <BaseHeader />

    <!-- Main Content -->
    <main>
      <slot />
    </main>

    <!-- Footer -->
    <BaseFooter />
  </div>
</template>
