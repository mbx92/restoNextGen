<template>
  <div>
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Analytics</h1>
      <p class="text-gray-600">Platform usage and performance metrics</p>
    </div>

    <UCard>
      <div class="text-center py-12">
        <div class="text-6xl mb-4">📊</div>
        <h3 class="text-xl font-semibold text-gray-900 mb-2">
          Analytics Coming Soon
        </h3>
        <p class="text-gray-600">
          Platform analytics and reporting features will be available here
        </p>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: "platform",
  middleware: ["platform-auth"],
});
</script>
