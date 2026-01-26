<script setup lang="ts">
definePageMeta({
  layout: "blank",
});

const { data: tenants } = await useFetch("/api/public/tenants");

useHead({
  title: "Select Tenant",
});
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-stone-50 to-amber-50 py-12">
    <div class="mx-auto max-w-4xl px-4">
      <div class="mb-8 text-center">
        <h1 class="text-4xl font-bold text-stone-900">Select Tenant</h1>
        <p class="mt-2 text-stone-600">
          Choose a tenant to view their landing page
        </p>
      </div>

      <div class="grid gap-6 md:grid-cols-2">
        <NuxtLink
          v-for="tenant in tenants"
          :key="tenant.id"
          :to="`/t/${tenant.slug}`"
          class="group relative overflow-hidden rounded-xl border-2 border-stone-200 bg-white p-6 transition hover:border-amber-500 hover:shadow-lg"
        >
          <div class="mb-4">
            <div
              class="mb-2 inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800"
            >
              {{ tenant.businessType }}
            </div>
            <h2
              class="text-2xl font-bold text-stone-900 group-hover:text-amber-700"
            >
              {{ tenant.name }}
            </h2>
            <p class="mt-1 text-sm text-stone-500">{{ tenant.slug }}</p>
          </div>

          <div v-if="tenant.businessInfo" class="mb-4">
            <p class="line-clamp-2 text-stone-600">
              {{ tenant.businessInfo.description }}
            </p>
          </div>

          <div
            v-if="tenant.themeConfig"
            class="flex items-center gap-2 text-sm text-stone-500"
          >
            <span>Theme:</span>
            <div
              class="h-4 w-4 rounded-full border border-stone-300"
              :style="{ backgroundColor: tenant.themeConfig.primaryColor }"
            />
            <div
              class="h-4 w-4 rounded-full border border-stone-300"
              :style="{ backgroundColor: tenant.themeConfig.secondaryColor }"
            />
          </div>

          <div
            class="mt-4 flex items-center text-sm font-medium text-amber-600 group-hover:text-amber-700"
          >
            View Landing Page
            <svg
              class="ml-1 h-4 w-4 transition group-hover:translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </NuxtLink>
      </div>

      <div class="mt-8 text-center">
        <NuxtLink
          to="/platform"
          class="inline-flex items-center text-sm text-stone-600 hover:text-amber-700"
        >
          <svg
            class="mr-1 h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to Platform
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
