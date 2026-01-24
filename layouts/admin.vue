<script setup lang="ts">
const navItems = [
  { label: "Dashboard", to: "/admin", icon: "i-heroicons-home" },
  {
    label: "Orders Queue",
    to: "/admin/orders",
    icon: "i-heroicons-queue-list",
  },
  {
    label: "Reservations",
    to: "/admin/reservations",
    icon: "i-heroicons-calendar",
  },
  { label: "Tables", to: "/admin/tables", icon: "i-heroicons-table-cells" },
  { label: "Menu", to: "/admin/menu", icon: "i-heroicons-book-open" },
  { label: "Landing Page", to: "/admin/landing", icon: "i-heroicons-star" },
];
</script>

<template>
  <div class="flex h-screen bg-stone-50">
    <!-- Sidebar -->
    <aside class="w-64 border-r border-stone-200 bg-white">
      <div class="flex h-16 items-center border-b border-stone-200 px-6">
        <NuxtLink to="/admin" class="flex items-center gap-2">
          <span class="text-lg font-serif font-bold text-stone-900">
            Admin <span class="text-amber-600">Panel</span>
          </span>
        </NuxtLink>
      </div>

      <nav class="space-y-1 p-4">
        <NuxtLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-stone-600 transition hover:bg-amber-50 hover:text-amber-900"
          active-class="!bg-amber-100 !text-amber-900"
        >
          <UIcon :name="item.icon" class="h-5 w-5" />
          {{ item.label }}
        </NuxtLink>
      </nav>

      <div class="absolute bottom-0 w-64 border-t border-stone-200 p-4">
        <NuxtLink
          to="/"
          class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-stone-500 transition hover:bg-stone-100 hover:text-stone-700"
        >
          <UIcon name="i-heroicons-arrow-left" class="h-5 w-5" />
          Back to Website
        </NuxtLink>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 overflow-y-auto">
      <div class="mx-auto max-w-7xl p-8">
        <slot />
      </div>
    </main>
  </div>
</template>
