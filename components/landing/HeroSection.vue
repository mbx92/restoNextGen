<script setup lang="ts">
const { data: landingData } = await useFetch("/api/public/landing");
const heroes = computed(() => landingData.value?.heroes || []);

const currentIndex = ref(0);
const isMultiple = computed(() => heroes.value.length > 1);

// Auto-play carousel
let intervalId: NodeJS.Timeout | null = null;

onMounted(() => {
  if (isMultiple.value) {
    intervalId = setInterval(() => {
      currentIndex.value = (currentIndex.value + 1) % heroes.value.length;
    }, 5000); // Change slide every 5 seconds
  }
});

onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId);
  }
});

const goToSlide = (index: number) => {
  currentIndex.value = index;
};

const currentHero = computed(() => heroes.value[currentIndex.value] || {});
</script>

<template>
  <section class="relative overflow-hidden py-24 sm:py-32">
    <div
      class="absolute -top-20 -left-20 h-96 w-96 rounded-full bg-amber-100/50 blur-3xl mix-blend-multiply"
    />
    <div
      class="absolute top-20 right-0 h-96 w-96 rounded-full bg-stone-200/50 blur-3xl mix-blend-multiply"
    />

    <div class="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="grid gap-12 lg:grid-cols-2 lg:items-center min-h-[600px]">
        <div class="text-center lg:text-left">
          <div class="min-h-[400px] flex flex-col">
            <div
              v-if="currentHero?.promoText"
              class="inline-flex items-center rounded-full border border-stone-200 bg-white px-3 py-1 text-xs font-medium text-stone-600 mb-6 shadow-sm w-fit mx-auto lg:mx-0"
            >
              <span class="flex h-2 w-2 rounded-full bg-amber-500 mr-2" />
              {{ currentHero.promoText }}
            </div>
            <h1
              class="text-4xl font-serif font-bold tracking-tight text-stone-900 sm:text-6xl mb-6 min-h-[120px] sm:min-h-[140px]"
            >
              {{ currentHero?.title || "Warm Your Soul with" }} <br >
              <span class="text-amber-700 italic">{{
                currentHero?.subtitle || "Authentic Flavors"
              }}</span>
            </h1>
            <p
              class="mx-auto lg:mx-0 mt-4 max-w-xl text-lg text-stone-600 leading-relaxed min-h-[80px]"
            >
              {{
                currentHero?.description ||
                "Experience the legendary Salmon Fish Soup that has been crafted to perfection."
              }}
            </p>
            <div class="flex-grow" />
            <div
              class="mt-10 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
            >
              <UButton
                :to="currentHero?.ctaLink || '/order'"
                size="xl"
                color="neutral"
                variant="solid"
                class="w-full sm:w-auto justify-center rounded-xl !bg-amber-700 hover:!bg-amber-800 active:!bg-amber-900 !text-white font-medium px-8 transition-transform hover:-translate-y-0.5"
              >
                {{ currentHero?.ctaText || "Order Now" }}
              </UButton>
              <UButton
                to="#menu"
                size="xl"
                color="neutral"
                variant="ghost"
                class="w-full sm:w-auto justify-center !text-stone-600 hover:!bg-stone-100 active:!bg-stone-200 rounded-xl"
              >
                View Full Menu &rarr;
              </UButton>
            </div>

            <!-- Carousel Indicators -->
            <div
              v-if="isMultiple"
              class="mt-8 flex items-center justify-center lg:justify-start gap-2"
            >
              <button
                v-for="(_, index) in heroes"
                :key="index"
                :class="[
                  'h-2 rounded-full transition-all duration-300',
                  currentIndex === index
                    ? 'w-8 bg-amber-700'
                    : 'w-2 bg-stone-300 hover:bg-stone-400',
                ]"
                @click="goToSlide(index)"
              />
            </div>
          </div>
        </div>

        <div class="relative mt-8 lg:mt-0">
          <div
            class="relative aspect-square w-full max-w-md mx-auto rounded-3xl overflow-hidden shadow-2xl rotate-3 hover:rotate-0 transition duration-500"
          >
            <img
              :key="currentIndex"
              :src="
                currentHero?.imageUrl ||
                'https://images.unsplash.com/photo-1547592166-23acbe32e33f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
              "
              :alt="currentHero?.title || 'Salmon Soup'"
              class="h-full w-full object-cover transition-opacity duration-500"
            >
            <div
              class="absolute inset-0 bg-gradient-to-t from-stone-900/40 to-transparent"
            />
          </div>

          <div
            class="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-xl max-w-[200px] border border-stone-100 hidden sm:block"
          >
            <div class="flex items-center gap-2 mb-1">
              <div class="flex text-amber-400">★★★★★</div>
            </div>
            <p class="text-xs text-stone-500 font-medium">
              "Best fish soup in town!"
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
