<script setup lang="ts">
const navLinks = [
  { label: "Our Menu", to: "#menu" },
  { label: "Reviews", to: "#reviews" },
  { label: "Location", to: "#location" },
];
</script>

<template>
  <header
    class="sticky top-0 z-50 w-full border-b border-stone-200 bg-stone-50/80 backdrop-blur-md"
  >
    <div
      class="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"
    >
      <NuxtLink to="/" class="flex items-center gap-2">
        <span class="text-xl font-serif font-bold tracking-tight text-stone-900"
          >Salm<span class="text-amber-600">o</span>nSoup.</span
        >
      </NuxtLink>

      <nav class="hidden md:flex items-center gap-8">
        <NuxtLink
          v-for="link in navLinks"
          :key="link.to"
          :to="link.to"
          class="text-sm font-medium text-stone-600 hover:text-amber-700 transition"
        >
          {{ link.label }}
        </NuxtLink>
      </nav>

      <div class="flex items-center gap-4">
        <UButton
          to="#menu"
          color="stone"
          variant="solid"
          class="hidden sm:flex rounded-full bg-stone-900 text-stone-50 hover:bg-stone-800"
        >
          Order Now
        </UButton>
      </div>
    </div>
  </header>
</template>
