<script setup lang="ts">
useSeoMeta({
  title: "Thank You for Your Review",
});

const router = useRouter();

onMounted(() => {
  // Auto redirect to home after 5 seconds
  setTimeout(() => {
    router.push("/");
  }, 5000);
});
</script>

<template>
  <div class="min-h-screen bg-stone-50 flex items-center justify-center px-4">
    <div class="text-center max-w-md">
      <div class="mb-6">
        <div
          class="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center"
        >
          <UIcon
            name="i-heroicons-check-circle-solid"
            class="w-10 h-10 text-green-600"
          />
        </div>
      </div>

      <h1 class="text-3xl font-serif font-bold text-stone-900 mb-4">
        Thank You!
      </h1>

      <p class="text-stone-600 mb-2">
        Your review has been submitted successfully.
      </p>
      <p class="text-sm text-stone-500 mb-8">
        It will be published after our team reviews it.
      </p>

      <div class="space-y-3">
        <UButton to="/" color="primary" size="lg" block> Back to Home </UButton>

        <p class="text-xs text-stone-400">Redirecting in 5 seconds...</p>
      </div>
    </div>
  </div>
</template>
