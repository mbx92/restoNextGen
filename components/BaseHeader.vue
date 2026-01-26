<script setup lang="ts">
interface Props {
  businessType?: string;
}

const props = withDefaults(defineProps<Props>(), {
  businessType: "restaurant",
});

// Try to get business type from inject (from parent page) or global state
const injectedBusinessType = inject<string>("businessType", undefined);
const businessTypeState = useState<string>("businessType");
const currentBusinessType = computed(
  () => injectedBusinessType || businessTypeState.value || props.businessType,
);

// Get tenant slug from inject or global state
const injectedTenantSlug = inject<string>("tenantSlug", undefined);
const tenantSlugState = useState<string>("tenantSlug");
const tenantSlug = computed(() => injectedTenantSlug || tenantSlugState.value);

// Fetch site settings with tenant parameter
const { data: siteSettings } = await useFetch("/api/public/site-settings", {
  query: computed(() => (tenantSlug.value ? { tenant: tenantSlug.value } : {})),
  key: computed(() => `site-settings-${tenantSlug.value || "default"}`),
  watch: [tenantSlug],
});

const headerSettings = computed(() => siteSettings.value?.header);

const logoText = computed(
  () =>
    headerSettings.value?.logoText ||
    (currentBusinessType.value === "retail" ? "Toko Kami" : "SalmonSoup."),
);
const logoUrl = computed(() => headerSettings.value?.logoUrl);

// Navigation links based on business type
const navLinks = computed(() => {
  if (currentBusinessType.value === "retail") {
    return [
      { label: "Produk", to: "#products" },
      { label: "Kategori", to: "#categories" },
      { label: "Kontak", to: "#contact" },
    ];
  }
  // Restaurant/Cafe/Bakery
  return [
    { label: "Our Menu", to: "#menu" },
    { label: "Reviews", to: "#reviews" },
    { label: "Location", to: "#location" },
  ];
});

const socialLinks = computed(() => {
  const links = [];
  if (headerSettings.value?.facebookUrl) {
    links.push({
      icon: "i-heroicons-globe-alt",
      url: headerSettings.value.facebookUrl,
      label: "Facebook",
    });
  }
  if (headerSettings.value?.instagramUrl) {
    links.push({
      icon: "i-heroicons-camera",
      url: headerSettings.value.instagramUrl,
      label: "Instagram",
    });
  }
  if (headerSettings.value?.twitterUrl) {
    links.push({
      icon: "i-heroicons-at-symbol",
      url: headerSettings.value.twitterUrl,
      label: "Twitter",
    });
  }
  return links;
});

// Header style based on business type
const headerClass = computed(() => {
  if (currentBusinessType.value === "retail") {
    return "sticky top-0 z-50 w-full border-b border-stone-200 bg-white shadow-sm";
  }
  return "sticky top-0 z-50 w-full border-b border-stone-200 bg-stone-50/80 backdrop-blur-md";
});
</script>

<template>
  <header :class="headerClass">
    <div
      class="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"
    >
      <NuxtLink to="/" class="flex items-center gap-2">
        <img v-if="logoUrl" :src="logoUrl" :alt="logoText" class="h-8 w-auto" />
        <span
          v-else
          class="text-xl font-serif font-bold tracking-tight text-stone-900"
        >
          {{ logoText }}
        </span>
      </NuxtLink>

      <nav class="hidden md:flex items-center gap-8">
        <NuxtLink
          v-for="link in navLinks"
          :key="link.to"
          :to="link.to"
          class="text-sm font-medium text-stone-600 transition"
          :class="
            currentBusinessType === 'retail'
              ? 'hover:text-theme-primary'
              : 'hover:text-amber-700'
          "
        >
          {{ link.label }}
        </NuxtLink>
      </nav>

      <div class="flex items-center gap-4">
        <div
          v-if="socialLinks.length > 0"
          class="hidden lg:flex items-center gap-2"
        >
          <UButton
            v-for="social in socialLinks"
            :key="social.url"
            :to="social.url"
            target="_blank"
            :icon="social.icon"
            variant="ghost"
            color="stone"
            size="sm"
            :aria-label="social.label"
          />
        </div>

        <UButton
          to="#menu"
          color="stone"
          variant="solid"
          class="hidden sm:flex rounded-full bg-stone-900 text-stone-50 hover:bg-stone-800"
        >
          Order Now
        </UButton>
      </div>
    </div>
  </header>
</template>
