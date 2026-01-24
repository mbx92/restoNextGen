<script setup lang="ts">
import HeroSection from "~/components/landing/HeroSection.vue";
import FeaturedSection from "~/components/landing/FeaturedSection.vue";
import ReviewSection from "~/components/landing/ReviewSection.vue";
import LocationSection from "~/components/landing/LocationSection.vue";

useHead({
  title: "SalmonSoup - Authentic Indonesian Seafood",
  meta: [
    {
      name: "description",
      content:
        "Best Salmon Fish Soup in Jakarta. Fresh ingredients, cozy vibes.",
    },
  ],
});
</script>

<template>
  <div>
    <HeroSection />
    <FeaturedSection />
    <ReviewSection />
    <LocationSection />
  </div>
</template>
