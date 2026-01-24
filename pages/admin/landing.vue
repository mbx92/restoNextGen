<script setup lang="ts">
definePageMeta({
  layout: "admin",
});

const { data: hero, refresh: refreshHero } = await useFetch(
  "/api/admin/landing/hero",
);
const { data: featuredItems, refresh: refreshFeatured } = await useFetch(
  "/api/admin/featured-menu/index",
);

const isEditingHero = ref(false);
const heroForm = ref({
  title: "",
  subtitle: "",
  description: "",
  ctaText: "Order Now",
  ctaLink: "#menu",
  promoText: "",
  imageUrl: "",
});

const editHero = () => {
  const active = hero.value?.find((h: any) => h.isActive);
  if (active) {
    heroForm.value = { ...active };
  }
  isEditingHero.value = true;
};

const saveHero = async () => {
  await $fetch("/api/admin/landing/hero", {
    method: "POST",
    body: heroForm.value,
  });
  await refreshHero();
  isEditingHero.value = false;
};
</script>

<template>
  <div>
    <div class="mb-8">
      <h1 class="text-3xl font-serif font-bold text-stone-900">Landing Page</h1>
      <p class="mt-2 text-stone-600">
        Manage hero section and featured content
      </p>
    </div>

    <!-- Hero Section -->
    <div class="mb-8 rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
      <div class="mb-4 flex items-center justify-between">
        <h2 class="text-xl font-semibold text-stone-900">Hero Section</h2>
        <UButton
          v-if="!isEditingHero"
          @click="editHero"
          color="neutral"
          variant="outline"
          class="!border-stone-300 !text-stone-700 hover:!bg-stone-50"
        >
          Edit Hero
        </UButton>
      </div>

      <div v-if="!isEditingHero && hero && hero.length > 0">
        <div
          v-for="h in hero.filter((h: any) => h.isActive)"
          :key="h.id"
          class="space-y-3"
        >
          <div class="rounded-lg border border-stone-100 bg-stone-50 p-4">
            <p class="text-sm font-medium text-stone-600">Title</p>
            <p class="text-stone-900">{{ h.title }}</p>
          </div>
          <div class="rounded-lg border border-stone-100 bg-stone-50 p-4">
            <p class="text-sm font-medium text-stone-600">Subtitle</p>
            <p class="text-amber-700 italic">{{ h.subtitle }}</p>
          </div>
          <div class="rounded-lg border border-stone-100 bg-stone-50 p-4">
            <p class="text-sm font-medium text-stone-600">Description</p>
            <p class="text-stone-700">{{ h.description }}</p>
          </div>
          <div
            v-if="h.promoText"
            class="rounded-lg border border-amber-100 bg-amber-50 p-4"
          >
            <p class="text-sm font-medium text-amber-700">Promo Text</p>
            <p class="text-amber-900">{{ h.promoText }}</p>
          </div>
        </div>
      </div>

      <div v-else-if="isEditingHero" class="space-y-4">
        <div>
          <label class="mb-2 block text-sm font-medium text-stone-700"
            >Title</label
          >
          <input
            v-model="heroForm.title"
            type="text"
            class="w-full rounded-lg border border-stone-300 px-4 py-2 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-100"
          />
        </div>
        <div>
          <label class="mb-2 block text-sm font-medium text-stone-700"
            >Subtitle</label
          >
          <input
            v-model="heroForm.subtitle"
            type="text"
            class="w-full rounded-lg border border-stone-300 px-4 py-2 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-100"
          />
        </div>
        <div>
          <label class="mb-2 block text-sm font-medium text-stone-700"
            >Description</label
          >
          <textarea
            v-model="heroForm.description"
            rows="3"
            class="w-full rounded-lg border border-stone-300 px-4 py-2 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-100"
          />
        </div>
        <div>
          <label class="mb-2 block text-sm font-medium text-stone-700"
            >Promo Text (optional)</label
          >
          <input
            v-model="heroForm.promoText"
            type="text"
            class="w-full rounded-lg border border-stone-300 px-4 py-2 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-100"
          />
        </div>
        <div class="flex gap-3">
          <UButton
            @click="saveHero"
            color="neutral"
            class="!bg-amber-700 !text-white hover:!bg-amber-800"
          >
            Save Hero
          </UButton>
          <UButton
            @click="isEditingHero = false"
            color="neutral"
            variant="outline"
            class="!border-stone-300 !text-stone-700 hover:!bg-stone-50"
          >
            Cancel
          </UButton>
        </div>
      </div>

      <div v-else class="py-8 text-center text-stone-500">
        No hero section configured
      </div>
    </div>

    <!-- Featured Menu Items -->
    <div class="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
      <div class="mb-4 flex items-center justify-between">
        <h2 class="text-xl font-semibold text-stone-900">
          Featured Menu Items
        </h2>
        <UButton
          color="neutral"
          class="!bg-amber-700 !text-white hover:!bg-amber-800"
        >
          Add Item
        </UButton>
      </div>

      <div v-if="featuredItems && featuredItems.length > 0" class="space-y-3">
        <div
          v-for="item in featuredItems"
          :key="item.id"
          class="flex items-center justify-between rounded-lg border border-stone-100 p-4 hover:bg-stone-50"
        >
          <div>
            <p class="font-medium text-stone-900">{{ item.name }}</p>
            <p class="text-sm text-stone-500">
              Rp {{ item.price.toLocaleString("id-ID") }}
            </p>
          </div>
          <span
            class="rounded-full px-3 py-1 text-xs font-medium"
            :class="
              item.isActive
                ? 'bg-green-100 text-green-800'
                : 'bg-stone-100 text-stone-600'
            "
          >
            {{ item.isActive ? "Active" : "Inactive" }}
          </span>
        </div>
      </div>
      <div v-else class="py-8 text-center text-stone-500">
        No featured items
      </div>
    </div>
  </div>
</template>
