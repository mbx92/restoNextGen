<script setup lang="ts">
const { data: landingData } = await useFetch("/api/public/landing");

const restaurantInfo = computed(() => {
  return landingData.value?.restaurantInfo;
});

const whatsappLink = computed(() => {
  if (!restaurantInfo.value?.phoneNumber) return "#";
  const phone = restaurantInfo.value.phoneNumber.replace(/\D/g, "");
  return `https://wa.me/${phone}`;
});

const mapsLink = computed(() => {
  if (!restaurantInfo.value?.mapsUrl) return "#";
  return restaurantInfo.value.mapsUrl;
});
</script>

<template>
  <section
    id="location"
    class="py-24 relative bg-stone-900 text-stone-100 overflow-hidden"
  >
    <div
      class="absolute inset-0 opacity-20 grayscale brightness-50 bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')] bg-cover bg-center"
    />

    <div class="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div
        class="rounded-3xl bg-stone-900/90 p-8 sm:p-12 border border-stone-700 backdrop-blur-xl max-w-4xl mx-auto shadow-2xl"
      >
        <div v-if="restaurantInfo" class="grid gap-12 md:grid-cols-2">
          <div>
            <h2 class="text-3xl font-serif font-bold mb-6">Come Visit Us</h2>
            <p
              v-if="restaurantInfo.description"
              class="text-stone-400 mb-8 leading-relaxed"
            >
              {{ restaurantInfo.description }}
            </p>

            <div class="space-y-6">
              <div class="flex items-start gap-4">
                <div class="p-2 bg-stone-800 rounded-lg">
                  <UIcon
                    name="i-heroicons-map-pin"
                    class="w-6 h-6 text-amber-500"
                  />
                </div>
                <div>
                  <h4 class="font-bold text-white">Address</h4>
                  <p class="text-stone-400 text-sm">
                    {{ restaurantInfo.address }}
                  </p>
                </div>
              </div>

              <div class="flex items-start gap-4">
                <div class="p-2 bg-stone-800 rounded-lg">
                  <UIcon
                    name="i-heroicons-clock"
                    class="w-6 h-6 text-amber-500"
                  />
                </div>
                <div>
                  <h4 class="font-bold text-white">Opening Hours</h4>
                  <p class="text-stone-400 text-sm">
                    {{ restaurantInfo.openingHours }}
                  </p>
                </div>
              </div>

              <div
                v-if="restaurantInfo.phoneNumber"
                class="flex items-start gap-4"
              >
                <div class="p-2 bg-stone-800 rounded-lg">
                  <UIcon
                    name="i-heroicons-phone"
                    class="w-6 h-6 text-amber-500"
                  />
                </div>
                <div>
                  <h4 class="font-bold text-white">Phone</h4>
                  <p class="text-stone-400 text-sm">
                    {{ restaurantInfo.phoneNumber }}
                  </p>
                </div>
              </div>

              <div v-if="restaurantInfo.email" class="flex items-start gap-4">
                <div class="p-2 bg-stone-800 rounded-lg">
                  <UIcon
                    name="i-heroicons-envelope"
                    class="w-6 h-6 text-amber-500"
                  />
                </div>
                <div>
                  <h4 class="font-bold text-white">Email</h4>
                  <p class="text-stone-400 text-sm">
                    {{ restaurantInfo.email }}
                  </p>
                </div>
              </div>
            </div>

            <div class="mt-8 flex gap-4">
              <UButton
                :to="mapsLink"
                target="_blank"
                color="primary"
                class="flex-1 bg-amber-600 hover:bg-amber-700 text-white rounded-xl"
              >
                Get Directions
              </UButton>
              <UButton
                :to="whatsappLink"
                target="_blank"
                variant="outline"
                color="white"
                class="flex-1 rounded-xl text-stone-200 border-stone-600 hover:bg-stone-800"
              >
                WhatsApp Us
              </UButton>
            </div>
          </div>

          <div
            class="h-64 md:h-full rounded-2xl bg-stone-800 overflow-hidden border border-stone-700"
          >
            <iframe
              v-if="restaurantInfo.mapsEmbedUrl"
              :src="restaurantInfo.mapsEmbedUrl"
              class="w-full h-full"
              style="border: 0"
              allowfullscreen
              loading="lazy"
              referrerpolicy="no-referrer-when-downgrade"
            />
            <div
              v-else
              class="w-full h-full flex items-center justify-center text-stone-600 bg-stone-200"
            >
              <span class="text-sm">Google Maps Embed Placeholder</span>
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <div v-else class="grid gap-12 md:grid-cols-2">
          <div class="space-y-6">
            <USkeleton class="h-8 w-48" />
            <USkeleton class="h-20 w-full" />
            <USkeleton class="h-16 w-full" />
            <USkeleton class="h-16 w-full" />
          </div>
          <USkeleton class="h-64 md:h-full" />
        </div>
      </div>
    </div>
  </section>
</template>
