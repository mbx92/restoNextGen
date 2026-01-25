<script setup lang="ts">
const { data: session } = await useFetch("/api/admin/auth/session");
const router = useRouter();
const isOpen = ref(false);

// Get business type from session
const businessType = computed(
  () => session.value?.user?.businessType || "restaurant",
);

// Dynamic navigation based on business type
const getNavItems = (type: string) => {
  const baseItems = [
    { label: "Dashboard", to: "/admin", icon: "i-heroicons-home" },
  ];

  const restaurantItems = [
    {
      label: "Reservations",
      to: "/admin/reservations",
      icon: "i-heroicons-calendar",
    },
    {
      label: "Tables",
      to: "/admin/tables",
      icon: "i-heroicons-rectangle-group",
    },
    {
      label: "Categories",
      to: "/admin/categories",
      icon: "i-heroicons-folder",
    },
    { label: "Menu Items", to: "/admin/menu", icon: "i-heroicons-book-open" },
    { label: "Orders", to: "/admin/orders", icon: "i-heroicons-shopping-cart" },
  ];

  const retailItems = [
    { label: "Products", to: "/admin/products", icon: "i-heroicons-cube" },
    {
      label: "Inventory",
      to: "/admin/inventory",
      icon: "i-heroicons-archive-box",
    },
    { label: "POS", to: "/admin/pos", icon: "i-heroicons-calculator" },
  ];

  const salonItems = [
    { label: "Services", to: "/admin/services", icon: "i-heroicons-sparkles" },
    {
      label: "Appointments",
      to: "/admin/appointments",
      icon: "i-heroicons-calendar",
    },
    { label: "Staff", to: "/admin/staff", icon: "i-heroicons-user-group" },
  ];

  const commonItems = [
    { label: "Landing Page", to: "/admin/landing", icon: "i-heroicons-star" },
    {
      label: "Featured Menu",
      to: "/admin/featured-menu",
      icon: "i-heroicons-sparkles",
    },
    {
      label: "Reviews",
      to: "/admin/reviews",
      icon: "i-heroicons-chat-bubble-left-right",
    },
    { label: "Location", to: "/admin/location", icon: "i-heroicons-map-pin" },
    { label: "Theme", to: "/admin/theme", icon: "i-heroicons-paint-brush" },
    {
      label: "Site Settings",
      to: "/admin/settings",
      icon: "i-heroicons-cog-6-tooth",
    },
  ];

  let moduleItems = [];
  if (type === "restaurant") {
    moduleItems = restaurantItems;
  } else if (type === "retail") {
    moduleItems = retailItems;
  } else if (type === "salon") {
    moduleItems = salonItems;
  }

  return [...baseItems, ...moduleItems, ...commonItems];
};

const navItems = computed(() => getNavItems(businessType.value));

async function handleLogout() {
  await $fetch("/api/admin/auth/logout", { method: "POST" });
  await router.push("/admin/login");
}
</script>

<template>
  <div class="flex h-screen bg-stone-50">
    <!-- Mobile Menu Button -->
    <div
      class="fixed top-0 left-0 right-0 z-50 flex items-center justify-between border-b border-stone-200 bg-white p-4 lg:hidden"
    >
      <NuxtLink to="/admin" class="flex items-center gap-2">
        <span class="text-lg font-serif font-bold text-stone-900">
          Admin <span class="text-primary-600">Panel</span>
        </span>
      </NuxtLink>
      <UButton
        icon="i-heroicons-bars-3"
        variant="ghost"
        @click="isOpen = !isOpen"
      />
    </div>

    <!-- Sidebar - Desktop -->
    <aside
      class="hidden lg:flex lg:w-64 lg:flex-col border-r border-stone-200 bg-white"
    >
      <div
        class="flex h-16 items-center justify-between border-b border-stone-200 px-6"
      >
        <NuxtLink to="/admin" class="flex items-center gap-2">
          <span class="text-lg font-serif font-bold text-stone-900">
            Admin <span class="text-primary-600">Panel</span>
          </span>
        </NuxtLink>
        <UBadge
          :color="
            businessType === 'restaurant'
              ? 'primary'
              : businessType === 'retail'
                ? 'secondary'
                : 'info'
          "
          variant="subtle"
          size="sm"
        >
          {{ businessType }}
        </UBadge>
      </div>

      <nav class="flex-1 space-y-1 p-4 overflow-y-auto">
        <NuxtLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-stone-600 transition hover:bg-primary-50 hover:text-primary-900"
          active-class="!bg-primary-100 !text-primary-900"
        >
          <UIcon :name="item.icon" class="h-5 w-5" />
          {{ item.label }}
        </NuxtLink>
      </nav>

      <div class="border-t border-stone-200 p-4 space-y-2">
        <div class="flex items-center justify-between px-3 py-2">
          <div class="text-xs text-stone-500">
            <div class="font-medium text-stone-900">
              {{ session?.user?.name || "Admin" }}
            </div>
            <div class="text-stone-400 truncate max-w-[140px]">
              {{ session?.user?.email }}
            </div>
          </div>
          <UButton
            variant="ghost"
            color="red"
            icon="i-heroicons-arrow-right-on-rectangle"
            @click="handleLogout"
          />
        </div>
        <NuxtLink
          to="/"
          class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-stone-500 transition hover:bg-stone-100 hover:text-stone-700"
        >
          <UIcon name="i-heroicons-arrow-left" class="h-5 w-5" />
          Back to Website
        </NuxtLink>
      </div>
    </aside>

    <!-- Mobile Sidebar Overlay -->
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 lg:hidden"
      role="dialog"
      aria-modal="true"
    >
      <!-- Backdrop -->
      <div
        class="fixed inset-0 bg-stone-900/50 backdrop-blur-sm transition-opacity"
        @click="isOpen = false"
      />

      <!-- Syllabus -->
      <div
        class="fixed inset-y-0 left-0 z-50 w-full max-w-xs bg-white p-4 shadow-xl transition-transform"
      >
        <div class="flex items-center justify-between mb-4">
          <span class="text-lg font-serif font-bold text-stone-900">
            Admin <span class="text-primary-600">Panel</span>
          </span>
          <UButton
            icon="i-heroicons-x-mark"
            variant="ghost"
            size="sm"
            @click="isOpen = false"
          />
        </div>

        <nav class="space-y-1">
          <NuxtLink
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-stone-600 transition hover:bg-primary-50 hover:text-primary-900"
            active-class="!bg-primary-100 !text-primary-900"
            @click="isOpen = false"
          >
            <UIcon :name="item.icon" class="h-5 w-5" />
            {{ item.label }}
          </NuxtLink>
        </nav>

        <div
          class="mt-auto border-t border-stone-200 py-4 space-y-2 absolute bottom-0 left-0 right-0 px-4 bg-white"
        >
          <div class="flex items-center justify-between px-3 py-2">
            <div class="text-xs text-stone-500">
              <div class="font-medium text-stone-900">
                {{ session?.user?.name || "Admin" }}
              </div>
              <div class="text-stone-400 truncate max-w-[140px]">
                {{ session?.user?.email }}
              </div>
            </div>
            <UButton
              variant="ghost"
              color="red"
              icon="i-heroicons-arrow-right-on-rectangle"
              @click="handleLogout"
            />
          </div>
          <NuxtLink
            to="/"
            class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-stone-500 transition hover:bg-stone-100 hover:text-stone-700"
            @click="isOpen = false"
          >
            <UIcon name="i-heroicons-arrow-left" class="h-5 w-5" />
            Back to Website
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <main class="flex-1 overflow-y-auto pt-16 lg:pt-0">
      <div class="mx-auto max-w-7xl p-4 lg:p-8">
        <slot />
      </div>
    </main>
  </div>
</template>
