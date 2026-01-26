<script setup lang="ts">
// Get tenant slug from parent context or route
const tenantSlug = inject<string>("tenantSlug", undefined);
const route = useRoute();
const slug = tenantSlug || (route.params.slug as string);

// Fetch landing data with tenant parameter
const { data: landingData } = await useFetch("/api/public/landing", {
  query: slug ? { tenant: slug } : {},
});

const businessInfo = computed(() => landingData.value?.businessInfo);
const featuredItems = computed(() => landingData.value?.featuredItems || []);
const categories = computed(() => {
  // Group items by category
  const grouped = new Map();
  featuredItems.value.forEach((item: any) => {
    const catName = item.category?.name || "Uncategorized";
    if (!grouped.has(catName)) {
      grouped.set(catName, []);
    }
    grouped.get(catName).push(item);
  });
  return Array.from(grouped.entries());
});

function formatPrice(price: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);
}
</script>

<template>
  <div class="min-h-screen bg-stone-50">
    <!-- Hero Section - Retail Style -->
    <section class="bg-white border-b border-stone-200">
      <div class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div class="text-center">
          <h1 class="text-4xl font-bold text-stone-900 sm:text-5xl">
            {{ businessInfo?.name || "Toko Kami" }}
          </h1>
          <p class="mt-4 text-lg text-stone-600 max-w-2xl mx-auto">
            {{
              businessInfo?.description ||
              "Belanja produk berkualitas dengan harga terbaik"
            }}
          </p>
        </div>

        <!-- Quick Info -->
        <div
          class="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3 max-w-3xl mx-auto"
        >
          <div
            class="flex items-center justify-center gap-2 text-sm text-stone-600"
          >
            <UIcon
              name="i-heroicons-map-pin"
              class="h-5 w-5 text-theme-primary"
            />
            <span>{{ businessInfo?.address || "Lokasi Toko" }}</span>
          </div>
          <div
            class="flex items-center justify-center gap-2 text-sm text-stone-600"
          >
            <UIcon
              name="i-heroicons-phone"
              class="h-5 w-5 text-theme-primary"
            />
            <span>{{ businessInfo?.phoneNumber || "Hubungi Kami" }}</span>
          </div>
          <div
            class="flex items-center justify-center gap-2 text-sm text-stone-600"
          >
            <UIcon
              name="i-heroicons-clock"
              class="h-5 w-5 text-theme-primary"
            />
            <span>Buka Setiap Hari</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Product Catalog -->
    <section class="py-12">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <!-- Categories & Products -->
        <div v-if="categories.length > 0" class="space-y-12">
          <div
            v-for="[categoryName, items] in categories"
            :key="categoryName"
            class="space-y-6"
          >
            <!-- Category Header -->
            <div class="border-l-4 border-theme-primary pl-4">
              <h2 class="text-2xl font-bold text-stone-900">
                {{ categoryName }}
              </h2>
            </div>

            <!-- Products Grid -->
            <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              <div
                v-for="item in items"
                :key="item.id"
                class="group relative overflow-hidden rounded-lg border border-stone-200 bg-white transition hover:shadow-lg"
              >
                <!-- Product Image -->
                <div class="aspect-square w-full overflow-hidden bg-stone-100">
                  <img
                    v-if="item.photoUrl"
                    :src="item.photoUrl"
                    :alt="item.name"
                    class="h-full w-full object-cover transition group-hover:scale-105"
                  />
                  <div
                    v-else
                    class="flex h-full w-full items-center justify-center bg-stone-200"
                  >
                    <UIcon
                      name="i-heroicons-photo"
                      class="h-12 w-12 text-stone-400"
                    />
                  </div>
                </div>

                <!-- Product Info -->
                <div class="p-3">
                  <h3
                    class="font-semibold text-stone-900 text-sm line-clamp-2 mb-1"
                  >
                    {{ item.name }}
                  </h3>
                  <p
                    v-if="item.description"
                    class="text-xs text-stone-600 line-clamp-2 mb-2"
                  >
                    {{ item.description }}
                  </p>
                  <div class="flex items-center justify-between">
                    <span class="text-lg font-bold text-theme-primary">
                      {{ formatPrice(item.price) }}
                    </span>
                    <span
                      v-if="item.isAvailable"
                      class="text-xs text-green-600 font-medium"
                    >
                      Tersedia
                    </span>
                    <span v-else class="text-xs text-stone-400"> Habis </span>
                  </div>
                </div>

                <!-- Quick Action -->
                <div
                  class="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition group-hover:opacity-100"
                >
                  <UButton
                    size="sm"
                    style="background-color: var(--primary-color); color: white"
                    class="rounded-lg"
                  >
                    Lihat Detail
                  </UButton>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="py-16 text-center">
          <UIcon
            name="i-heroicons-shopping-bag"
            class="mx-auto h-16 w-16 text-stone-300"
          />
          <p class="mt-4 text-stone-600">Belum ada produk yang ditampilkan</p>
        </div>
      </div>
    </section>

    <!-- Contact CTA -->
    <section class="bg-stone-900 py-16">
      <div class="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
        <h2 class="text-3xl font-bold text-white">Ada Pertanyaan?</h2>
        <p class="mt-4 text-stone-300">
          Hubungi kami untuk informasi lebih lanjut atau pemesanan
        </p>
        <div class="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <UButton
            v-if="businessInfo?.phoneNumber"
            :to="`https://wa.me/${businessInfo.phoneNumber.replace(/\D/g, '')}`"
            target="_blank"
            size="lg"
            style="background-color: var(--primary-color); color: white"
            class="rounded-xl"
          >
            <UIcon name="i-heroicons-phone" class="mr-2" />
            Hubungi WhatsApp
          </UButton>
          <UButton
            v-if="businessInfo?.mapsUrl"
            :to="businessInfo.mapsUrl"
            target="_blank"
            size="lg"
            variant="outline"
            color="white"
            class="rounded-xl"
          >
            <UIcon name="i-heroicons-map-pin" class="mr-2" />
            Lihat Lokasi
          </UButton>
        </div>
      </div>
    </section>
  </div>
</template>
