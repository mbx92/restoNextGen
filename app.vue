<template>
  <UApp>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>

<script setup lang="ts">
// Load theme configuration
const { data: theme } = await useFetch("/api/public/theme");

// Apply theme CSS variables
if (theme.value && import.meta.client) {
  const root = document.documentElement;
  if (theme.value.primaryColor) {
    root.style.setProperty("--color-primary", theme.value.primaryColor);
  }
  if (theme.value.secondaryColor) {
    root.style.setProperty("--color-secondary", theme.value.secondaryColor);
  }
  if (theme.value.fontFamily) {
    root.style.setProperty("--font-family", theme.value.fontFamily);
  }
  if (theme.value.customCss) {
    const style = document.createElement("style");
    style.textContent = theme.value.customCss;
    document.head.appendChild(style);
  }
}
</script>
