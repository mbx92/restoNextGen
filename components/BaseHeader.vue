<script setup lang="ts">
const { data: siteSettings } = await useFetch("/api/public/site-settings");

const headerSettings = computed(() => siteSettings.value?.header);

const logoText = computed(
  () => headerSettings.value?.logoText || "SalmonSoup.",
);
const logoUrl = computed(() => headerSettings.value?.logoUrl);

const navLinks = [
  { label: "Our Menu", to: "#menu" },
  { label: "Reviews", to: "#reviews" },
  { label: "Location", to: "#location" },
];

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
</script>

<template>
  <header
    class="sticky top-0 z-50 w-full border-b border-stone-200 bg-stone-50/80 backdrop-blur-md"
  >
    <div
      class="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"
    >
      <NuxtLink to="/" class="flex items-center gap-2">
        <img v-if="logoUrl" :src="logoUrl" :alt="logoText" class="h-8 w-auto" >
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
          class="text-sm font-medium text-stone-600 hover:text-amber-700 transition"
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
