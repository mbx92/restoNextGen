<script setup lang="ts">
// Default layout for public pages
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
