<script setup lang="ts">
// Get tenant slug from inject or global state
const injectedTenantSlug = inject<string>("tenantSlug", undefined);
const tenantSlugState = useState<string>("tenantSlug");
const tenantSlug = computed(() => injectedTenantSlug || tenantSlugState.value);

// Fetch data with tenant parameter
const { data: siteSettings } = await useFetch("/api/public/site-settings", {
  query: computed(() => (tenantSlug.value ? { tenant: tenantSlug.value } : {})),
  key: computed(() => `footer-site-settings-${tenantSlug.value || "default"}`),
  watch: [tenantSlug],
});
const { data: landingData } = await useFetch("/api/public/landing", {
  query: computed(() => (tenantSlug.value ? { tenant: tenantSlug.value } : {})),
  key: computed(() => `footer-landing-${tenantSlug.value || "default"}`),
  watch: [tenantSlug],
});

const footerSettings = computed(() => siteSettings.value?.footer);
const headerSettings = computed(() => siteSettings.value?.header);
const restaurantInfo = computed(() => landingData.value?.restaurantInfo);

const logoText = computed(
  () => headerSettings.value?.logoText || "SalmonSoup.",
);
const copyrightText = computed(
  () =>
    footerSettings.value?.copyrightText ||
    "© 2026 SalmonSoup. All rights reserved.",
);

const footerLinks = computed(() => {
  return (
    (footerSettings.value?.footerLinks as { label: string; url: string }[]) ||
    []
  );
});

const socialLinks = computed(() => {
  const links = [];
  if (headerSettings.value?.instagramUrl) {
    links.push({
      label: "Instagram",
      url: headerSettings.value.instagramUrl,
      icon: "i-heroicons-camera",
    });
  }
  if (headerSettings.value?.facebookUrl) {
    links.push({
      label: "Facebook",
      url: headerSettings.value.facebookUrl,
      icon: "i-heroicons-globe-alt",
    });
  }
  if (headerSettings.value?.twitterUrl) {
    links.push({
      label: "Twitter",
      url: headerSettings.value.twitterUrl,
      icon: "i-heroicons-at-symbol",
    });
  }
  return links;
});
</script>

<template>
  <footer class="bg-stone-900 py-12 text-stone-400">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="grid gap-8 md:grid-cols-3">
        <!-- Brand -->
        <div>
          <h3 class="font-serif text-2xl font-bold text-stone-100 mb-4">
            {{ logoText }}
          </h3>
          <p
            v-if="restaurantInfo?.description"
            class="text-sm leading-relaxed max-w-xs"
          >
            {{ restaurantInfo.description }}
          </p>
        </div>

        <!-- Visit Us -->
        <div v-if="restaurantInfo">
          <h4 class="font-bold text-stone-100 mb-4">Visit Us</h4>
          <p class="text-sm whitespace-pre-line">
            {{ restaurantInfo.address }}
          </p>
          <p class="mt-2 text-sm whitespace-pre-line">
            {{ restaurantInfo.openingHours }}
          </p>
        </div>

        <!-- Contact -->
        <div>
          <h4 class="font-bold text-stone-100 mb-4">Contact</h4>
          <p v-if="restaurantInfo?.phoneNumber" class="text-sm">
            {{ restaurantInfo.phoneNumber }}
          </p>
          <p v-if="restaurantInfo?.email" class="text-sm">
            {{ restaurantInfo.email }}
          </p>

          <!-- Social Links -->
          <div v-if="socialLinks.length > 0" class="mt-4 flex gap-3">
            <UButton
              v-for="social in socialLinks"
              :key="social.url"
              :to="social.url"
              target="_blank"
              :icon="social.icon"
              variant="ghost"
              color="white"
              size="sm"
              :aria-label="social.label"
              class="hover:bg-stone-800"
            />
          </div>
        </div>
      </div>

      <!-- Footer Links & Copyright -->
      <div
        class="mt-12 border-t border-stone-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4"
      >
        <p class="text-xs">{{ copyrightText }}</p>

        <div v-if="footerLinks.length > 0" class="flex gap-6">
          <a
            v-for="link in footerLinks"
            :key="link.url"
            :href="link.url"
            class="text-xs hover:text-stone-200 transition"
          >
            {{ link.label }}
          </a>
        </div>
      </div>
    </div>
  </footer>
</template>
