<script setup lang="ts">
import HeroSection from "~/components/landing/HeroSection.vue";
import FeaturedSection from "~/components/landing/FeaturedSection.vue";
import ReviewSection from "~/components/landing/ReviewSection.vue";
import LocationSection from "~/components/landing/LocationSection.vue";
import RetailCatalog from "~/components/landing/RetailCatalog.vue";

const route = useRoute();
const slug = route.params.slug as string;

// Fetch tenant data by slug (for verification and metadata)
const { data: tenantData, error } = await useFetch(
  `/api/public/tenant/${slug}`,
);

if (error.value || !tenantData.value) {
  throw createError({
    statusCode: 404,
    statusMessage: `Tenant "${slug}" tidak ditemukan`,
  });
}

const { tenant, businessInfo, themeConfig } = tenantData.value;

// Determine landing layout based on business type
const isRestaurant = computed(() =>
  ["restaurant", "cafe", "bakery"].includes(tenant.businessType),
);
const isRetail = computed(() => tenant.businessType === "retail");

// Set page meta
useHead({
  title: businessInfo?.name || tenant.name,
  meta: [
    {
      name: "description",
      content: businessInfo?.description || `Landing page untuk ${tenant.name}`,
    },
  ],
});

// Apply theme to page immediately (both SSR and client)
if (themeConfig) {
  // Set CSS variables with higher specificity
  useHead({
    style: [
      {
        innerHTML: `
          :root, body, html {
            --primary-color: ${themeConfig.primaryColor} !important;
            --secondary-color: ${themeConfig.secondaryColor} !important;
          }
        `,
      },
    ],
    bodyAttrs: {
      style: `--primary-color: ${themeConfig.primaryColor}; --secondary-color: ${themeConfig.secondaryColor};`,
    },
  });
}

// Provide tenant slug to child components via context
provide("tenantSlug", slug);
provide("businessType", tenant.businessType);

// Also set global state for components outside page (like layout header/footer)
const tenantSlugState = useState("tenantSlug", () => slug);
const businessTypeState = useState("businessType", () => tenant.businessType);
const themeState = useState("themeConfig", () => themeConfig);
tenantSlugState.value = slug;
businessTypeState.value = tenant.businessType;
themeState.value = themeConfig;
</script>

<template>
  <div>
    <!-- Restaurant/Cafe/Bakery Layout -->
    <template v-if="isRestaurant">
      <HeroSection />
      <FeaturedSection />
      <ReviewSection />
      <LocationSection />
    </template>

    <!-- Retail/Toko Layout -->
    <template v-else-if="isRetail">
      <RetailCatalog />
    </template>

    <!-- Default fallback -->
    <template v-else>
      <HeroSection />
      <FeaturedSection />
    </template>
  </div>
</template>
