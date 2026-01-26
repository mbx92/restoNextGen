<script setup lang="ts">
const router = useRouter();

const closePOS = () => {
  router.push("/admin/transactions");
};
</script>

<template>
  <div class="h-screen w-screen bg-stone-50 overflow-hidden">
    <!-- Top Bar with Close Button -->
    <div
      class="h-16 bg-white border-b border-stone-200 flex items-center justify-between px-6 shadow-sm"
    >
      <div class="flex items-center gap-3">
        <UIcon name="i-heroicons-calculator" class="w-6 h-6 text-primary-600" />
        <h1 class="text-xl font-serif font-bold text-stone-900">
          Point of Sale
        </h1>
      </div>
      <UButton
        @click="closePOS"
        variant="outline"
        color="neutral"
        icon="i-heroicons-x-mark"
      >
        Close POS
      </UButton>
    </div>

    <!-- Fullscreen Content -->
    <div class="h-[calc(100vh-4rem)]">
      <slot />
    </div>
  </div>
</template>
