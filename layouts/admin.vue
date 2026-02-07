<script setup lang="ts">
import { PERMISSIONS } from "~/server/utils/rbac";

const { data: session } = await useFetch("/api/admin/auth/session");
const { hasFeature } = useFeatures();
const router = useRouter();
const isOpen = ref(false);

// Get user role and business type from session
const userRole = computed(() => session.value?.user?.role || null);
const businessType = computed(
  () => session.value?.user?.businessType?.toLowerCase() || "restaurant",
);

// Permission check function (client-side, using static matrix)
const canAccess = (permission: string) => {
  // If no permission required, always allow
  if (!permission) return true;

  // If no role yet (still loading), hide menu items with permissions
  if (!userRole.value) return false;

  const allowedRoles = PERMISSIONS[permission as keyof typeof PERMISSIONS];
  return allowedRoles ? allowedRoles.includes(userRole.value) : true;
};

// Dynamic navigation based on business type AND permissions
const navItems = computed(() => {
  const type = businessType.value;

  const baseItems = [
    { label: "Dashboard", to: "/admin", icon: "i-heroicons-home" },
  ];

  const restaurantItems = [
    {
      label: "Reservations",
      to: "/admin/reservations",
      icon: "i-heroicons-calendar",
      permission: "MANAGE_RESERVATIONS",
    },
    {
      label: "Tables",
      to: "/admin/tables",
      icon: "i-heroicons-rectangle-group",
      permission: "MANAGE_TABLES",
    },
    {
      label: "Categories",
      to: "/admin/categories",
      icon: "i-heroicons-folder",
      permission: "MANAGE_CATEGORIES",
    },
    {
      label: "Menu Items",
      to: "/admin/menu",
      icon: "i-heroicons-book-open",
      permission: "MANAGE_MENU",
    },
    {
      label: "Orders",
      to: "/admin/orders",
      icon: "i-heroicons-shopping-cart",
      permission: "VIEW_ALL_ORDERS",
    },
    {
      label: "CRM",
      icon: "i-heroicons-user-group",
      children: [
        {
          label: "Customers",
          to: "/admin/crm/customers",
          icon: "i-heroicons-users",
        },
        {
          label: "Loyalty",
          to: "/admin/crm/loyalty",
          icon: "i-heroicons-gift",
        },
        {
          label: "Campaigns",
          to: "/admin/crm/campaigns",
          icon: "i-heroicons-megaphone",
        },
      ],
    },
  ];

  const retailItems = [
    { label: "Products", to: "/admin/products", icon: "i-heroicons-cube" },
    {
      label: "Inventory",
      to: "/admin/inventory",
      icon: "i-heroicons-archive-box",
    },
    {
      label: "Transactions",
      to: "/admin/transactions",
      icon: "i-heroicons-receipt-percent",
    },
    {
      label: "CRM",
      icon: "i-heroicons-users",
      children: [
        {
          label: "Customers",
          to: "/admin/crm/customers",
          icon: "i-heroicons-user-group",
        },
        {
          label: "Loyalty",
          to: "/admin/crm/loyalty",
          icon: "i-heroicons-gift",
        },
        {
          label: "Campaigns",
          to: "/admin/crm/campaigns",
          icon: "i-heroicons-megaphone",
        },
      ],
    },
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
    {
      label: "Users",
      to: "/admin/users",
      icon: "i-heroicons-user-group",
      permission: "VIEW_USERS",
    },
    {
      label: "CMS",
      icon: "i-heroicons-document-text",
      permission: "MANAGE_LANDING",
      children: [
        {
          label: "Landing Page",
          to: "/admin/landing",
          icon: "i-heroicons-star",
        },
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
        {
          label: "Location",
          to: "/admin/location",
          icon: "i-heroicons-map-pin",
        },
      ],
    },
    {
      label: "Plan & Features",
      to: "/admin/features",
      icon: "i-heroicons-sparkles",
    },
    {
      label: "Settings",
      icon: "i-heroicons-cog-6-tooth",
      permission: "MANAGE_SETTINGS",
      children: [
        {
          label: "System Settings",
          to: "/admin/system-settings",
          icon: "i-heroicons-cog-8-tooth",
        },
        {
          label: "Theme",
          to: "/admin/theme",
          icon: "i-heroicons-paint-brush",
        },
        {
          label: "Site Settings",
          to: "/admin/settings",
          icon: "i-heroicons-adjustments-horizontal",
        },
      ],
    },
  ];

  let moduleItems: any[] = [];
  const normalizedType = type?.toLowerCase() || "restaurant";
  if (normalizedType === "restaurant") {
    moduleItems = restaurantItems;
  } else if (normalizedType === "retail") {
    moduleItems = retailItems;
  } else if (normalizedType === "salon") {
    moduleItems = salonItems;
  }

  const allItems = [...baseItems, ...moduleItems, ...commonItems];

  // Filter by permissions and features
  return allItems.filter((item) => {
    // Check permission
    if (item.permission && !canAccess(item.permission)) {
      return false;
    }

    // Check feature gate for CMS menu
    if (item.label === "CMS" && !hasFeature("CONTENT_MANAGEMENT_SERVICE")) {
      return false;
    }

    return true;
  });
});

async function handleLogout() {
  await $fetch("/api/admin/auth/logout", { method: "POST" });
  await router.push("/login");
}

// Track expanded menu groups - only one can be open at a time
const expandedMenu = ref<string | null>(null);

const toggleMenu = (label: string) => {
  // Toggle: if clicking the same menu, close it; otherwise open the new one
  expandedMenu.value = expandedMenu.value === label ? null : label;
};

const isMenuExpanded = (label: string) => {
  return expandedMenu.value === label;
};

// Check if any child route is active (for highlighting only, not for auto-expand on click)
const route = useRoute();
const isChildActive = (children: any[]) => {
  return children?.some((child: any) => route.path === child.to);
};

// Auto-expand menu if child is active on initial load only
onMounted(() => {
  for (const item of navItems.value) {
    if (item.children && isChildActive(item.children)) {
      expandedMenu.value = item.label;
      break;
    }
  }
});
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
        <template v-for="item in navItems" :key="item.label">
          <!-- Regular menu item -->
          <NuxtLink
            v-if="!item.children"
            :to="item.to"
            class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-stone-600 transition hover:bg-primary-50 hover:text-primary-900"
            active-class="!bg-primary-100 !text-primary-900"
          >
            <UIcon :name="item.icon" class="h-5 w-5" />
            {{ item.label }}
          </NuxtLink>

          <!-- Collapsible menu group -->
          <div v-else>
            <button
              class="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition"
              :class="[
                isMenuExpanded(item.label) || isChildActive(item.children)
                  ? 'bg-primary-50 text-primary-900'
                  : 'text-stone-600 hover:bg-primary-50 hover:text-primary-900',
              ]"
              @click="toggleMenu(item.label)"
            >
              <div class="flex items-center gap-3">
                <UIcon :name="item.icon" class="h-5 w-5" />
                {{ item.label }}
              </div>
              <UIcon
                name="i-heroicons-chevron-down"
                class="h-4 w-4 transition-transform"
                :class="{ 'rotate-180': isMenuExpanded(item.label) }"
              />
            </button>
            <div
              v-show="isMenuExpanded(item.label)"
              class="mt-1 ml-4 space-y-1 border-l-2 border-stone-200 pl-3"
            >
              <NuxtLink
                v-for="child in item.children"
                :key="child.to"
                :to="child.to"
                class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-stone-500 transition hover:bg-primary-50 hover:text-primary-900"
                active-class="!bg-primary-100 !text-primary-900"
              >
                <UIcon :name="child.icon" class="h-4 w-4" />
                {{ child.label }}
              </NuxtLink>
            </div>
          </div>
        </template>
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
          <template v-for="item in navItems" :key="item.label">
            <!-- Regular menu item -->
            <NuxtLink
              v-if="!item.children"
              :to="item.to"
              class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-stone-600 transition hover:bg-primary-50 hover:text-primary-900"
              active-class="!bg-primary-100 !text-primary-900"
              @click="isOpen = false"
            >
              <UIcon :name="item.icon" class="h-5 w-5" />
              {{ item.label }}
            </NuxtLink>

            <!-- Collapsible menu group -->
            <div v-else>
              <button
                class="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition"
                :class="[
                  isMenuExpanded(item.label) || isChildActive(item.children)
                    ? 'bg-primary-50 text-primary-900'
                    : 'text-stone-600 hover:bg-primary-50 hover:text-primary-900',
                ]"
                @click="toggleMenu(item.label)"
              >
                <div class="flex items-center gap-3">
                  <UIcon :name="item.icon" class="h-5 w-5" />
                  {{ item.label }}
                </div>
                <UIcon
                  name="i-heroicons-chevron-down"
                  class="h-4 w-4 transition-transform"
                  :class="{ 'rotate-180': isMenuExpanded(item.label) }"
                />
              </button>
              <div
                v-show="isMenuExpanded(item.label)"
                class="mt-1 ml-4 space-y-1 border-l-2 border-stone-200 pl-3"
              >
                <NuxtLink
                  v-for="child in item.children"
                  :key="child.to"
                  :to="child.to"
                  class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-stone-500 transition hover:bg-primary-50 hover:text-primary-900"
                  active-class="!bg-primary-100 !text-primary-900"
                  @click="isOpen = false"
                >
                  <UIcon :name="child.icon" class="h-4 w-4" />
                  {{ child.label }}
                </NuxtLink>
              </div>
            </div>
          </template>
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
