<template>
  <div class="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50">
    <div class="container mx-auto px-4 py-16">
      <div class="mx-auto max-w-2xl text-center">
        <!-- Success Icon -->
        <div class="mb-8 flex justify-center">
          <div
            class="flex h-24 w-24 items-center justify-center rounded-full bg-green-100"
          >
            <UIcon
              name="i-heroicons-check-circle"
              class="h-16 w-16 text-green-600"
            />
          </div>
        </div>

        <!-- Title -->
        <h1 class="mb-4 text-4xl font-bold text-gray-900">
          Selamat! Bisnis Anda Sudah Siap 🎉
        </h1>
        <p class="mb-8 text-xl text-gray-600">
          Kami telah menyiapkan sistem untuk bisnis Anda
        </p>

        <!-- Info Card -->
        <UCard class="mb-8">
          <div class="space-y-4 text-left">
            <div>
              <p class="text-sm font-medium text-gray-500">URL Bisnis Anda:</p>
              <p class="text-lg font-bold text-green-600">
                {{ tenantSlug }}.yourapp.com
              </p>
            </div>

            <div class="border-t pt-4">
              <p class="mb-2 text-sm font-medium text-gray-700">
                Langkah Selanjutnya:
              </p>
              <ul class="space-y-2 text-sm text-gray-600">
                <li class="flex items-start">
                  <UIcon
                    name="i-heroicons-check"
                    class="mr-2 mt-0.5 h-5 w-5 text-green-600"
                  />
                  Login ke dashboard admin Anda
                </li>
                <li class="flex items-start">
                  <UIcon
                    name="i-heroicons-check"
                    class="mr-2 mt-0.5 h-5 w-5 text-green-600"
                  />
                  Lengkapi informasi bisnis
                </li>
                <li class="flex items-start">
                  <UIcon
                    name="i-heroicons-check"
                    class="mr-2 mt-0.5 h-5 w-5 text-green-600"
                  />
                  Tambahkan menu/produk Anda
                </li>
                <li class="flex items-start">
                  <UIcon
                    name="i-heroicons-check"
                    class="mr-2 mt-0.5 h-5 w-5 text-green-600"
                  />
                  Customize tampilan website
                </li>
              </ul>
            </div>
          </div>
        </UCard>

        <!-- Action Buttons -->
        <div class="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <UButton size="xl" color="primary" to="/admin" class="sm:w-auto">
            Ke Dashboard Admin
            <UIcon name="i-heroicons-arrow-right" class="ml-2" />
          </UButton>
          <UButton
            size="xl"
            variant="outline"
            color="neutral"
            :to="`https://${tenantSlug}.yourapp.com`"
            target="_blank"
            class="sm:w-auto"
          >
            Lihat Website Anda
            <UIcon name="i-heroicons-arrow-top-right-on-square" class="ml-2" />
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: "blank",
});

const route = useRoute();

const tenantSlug = route.query.slug as string;

if (!tenantSlug) {
  navigateTo("/onboarding");
}
</script>
