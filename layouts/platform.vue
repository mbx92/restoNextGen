<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Sidebar -->
    <div
      class="fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200"
    >
      <!-- Header -->
      <div class="flex items-center h-16 px-6 border-b border-gray-200">
        <h1 class="text-xl font-bold text-gray-900">Platform Admin</h1>
      </div>

      <!-- Navigation -->
      <nav class="p-4 space-y-1">
        <NuxtLink
          v-for="item in menuItems"
          :key="item.to"
          :to="item.to"
          class="flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors"
          active-class="bg-primary-50 text-primary-600"
          exact-active-class="bg-primary-50 text-primary-600"
          :class="[
            isActiveRoute(item.to)
              ? 'bg-primary-50 text-primary-600'
              : 'text-gray-700 hover:bg-gray-50',
          ]"
        >
          <UIcon :name="item.icon" class="w-5 h-5" />
          {{ item.label }}
        </NuxtLink>
      </nav>

      <!-- User Section -->
      <div
        class="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div
              class="flex items-center justify-center w-8 h-8 rounded-full bg-primary-100"
            >
              <UIcon name="i-heroicons-user" class="w-4 h-4 text-primary-600" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900 truncate">
                {{ session?.user?.name }}
              </p>
              <p class="text-xs text-gray-500 truncate">Super Admin</p>
            </div>
          </div>
          <UButton
            icon="i-heroicons-arrow-right-on-rectangle"
            variant="ghost"
            color="neutral"
            size="sm"
            @click="handleLogout"
          />
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="pl-64">
      <!-- Top Bar -->
      <div
        class="sticky top-0 z-40 flex items-center h-16 px-6 bg-white border-b border-gray-200"
      >
        <div class="flex items-center justify-between flex-1">
          <h2 class="text-lg font-semibold text-gray-900">{{ pageTitle }}</h2>
        </div>
      </div>

      <!-- Page Content -->
      <main class="p-6">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute();

// Fetch session
const { data: session } = await useFetch("/api/platform/auth/session");

// Redirect if not authenticated
if (!session.value?.user) {
  await navigateTo("/platform/login");
}

const menuItems = [
  {
    label: "Dashboard",
    to: "/platform",
    icon: "i-heroicons-home",
  },
  {
    label: "Tenants",
    to: "/platform/tenants",
    icon: "i-heroicons-building-storefront",
  },
  {
    label: "RBAC",
    to: "/platform/rbac",
    icon: "i-heroicons-shield-check",
  },
  {
    label: "Subscriptions",
    to: "/platform/subscriptions",
    icon: "i-heroicons-credit-card",
  },
  {
    label: "Analytics",
    to: "/platform/analytics",
    icon: "i-heroicons-chart-bar",
  },
  {
    label: "Settings",
    to: "/platform/settings",
    icon: "i-heroicons-cog-6-tooth",
  },
];

const pageTitle = computed(() => {
  const currentPath = route.path;
  const item = menuItems.find((m) => m.to === currentPath);
  return item?.label || "Dashboard";
});

const isActiveRoute = (path: string) => {
  if (path === "/platform") {
    return route.path === "/platform";
  }
  return route.path.startsWith(path);
};

const handleLogout = async () => {
  await $fetch("/api/platform/auth/logout", { method: "POST" });
  await navigateTo("/platform/login");
};
</script>
