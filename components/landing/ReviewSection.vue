<script setup lang="ts">
// Get tenant slug from parent context or route
const tenantSlug = inject<string>("tenantSlug", undefined);
const route = useRoute();
const slug = tenantSlug || (route.params.slug as string);

// Fetch landing data with tenant parameter
const { data: landingData } = await useFetch("/api/public/landing", {
  query: slug ? { tenant: slug } : {},
});

const allReviews = computed(() => {
  return landingData.value?.reviews || [];
});

const currentIndex = ref(0);
const itemsPerPage = 3;
const sectionRef = ref<HTMLElement | null>(null);
const autoPlayInterval = ref<NodeJS.Timeout | null>(null);
const isPaused = ref(false);

const hasMultiplePages = computed(() => allReviews.value.length > itemsPerPage);

const displayedReviews = computed(() => {
  const total = allReviews.value.length;
  if (total === 0) return [];
  if (total <= itemsPerPage) return allReviews.value;

  const result = [];
  for (let i = 0; i < itemsPerPage; i++) {
    const index = (currentIndex.value + i) % total;
    result.push(allReviews.value[index]);
  }
  return result;
});

function prev() {
  const total = allReviews.value.length;
  currentIndex.value = (currentIndex.value - 1 + total) % total;
  resetAutoPlay();
}

function next() {
  const total = allReviews.value.length;
  currentIndex.value = (currentIndex.value + 1) % total;
  resetAutoPlay();
}

function startAutoPlay() {
  if (!hasMultiplePages.value) return;
  stopAutoPlay();
  autoPlayInterval.value = setInterval(() => {
    if (!isPaused.value) {
      next();
    }
  }, 4000);
}

function stopAutoPlay() {
  if (autoPlayInterval.value) {
    clearInterval(autoPlayInterval.value);
    autoPlayInterval.value = null;
  }
}

function resetAutoPlay() {
  if (!isPaused.value) {
    startAutoPlay();
  }
}

function handleMouseEnter() {
  isPaused.value = true;
}

function handleMouseLeave() {
  isPaused.value = false;
  if (!autoPlayInterval.value) {
    startAutoPlay();
  }
}

onMounted(() => {
  if (!sectionRef.value) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          startAutoPlay();
        } else {
          stopAutoPlay();
        }
      });
    },
    { threshold: 0.3 },
  );

  observer.observe(sectionRef.value);

  onUnmounted(() => {
    observer.disconnect();
    stopAutoPlay();
  });
});
</script>

<template>
  <section id="reviews" ref="sectionRef" class="py-24 bg-stone-100">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-16">
        <h2 class="text-3xl font-serif font-bold text-stone-900">
          What Our Guests Say
        </h2>
        <p class="mt-3 text-stone-600">
          Read experiences from our valued customers
        </p>
      </div>

      <div v-if="displayedReviews.length > 0" class="relative">
        <!-- Left Arrow -->
        <UButton
          v-if="hasMultiplePages"
          icon="i-heroicons-chevron-left"
          color="neutral"
          variant="solid"
          size="lg"
          class="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-20 hidden lg:flex shadow-lg"
          @click="prev"
        />

        <!-- Right Arrow -->
        <UButton
          v-if="hasMultiplePages"
          icon="i-heroicons-chevron-right"
          color="neutral"
          variant="solid"
          size="lg"
          class="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-20 hidden lg:flex shadow-lg"
          @click="next"
        />

        <div
          class="relative overflow-hidden"
          @mouseenter="handleMouseEnter"
          @mouseleave="handleMouseLeave"
        >
          <!-- Left Fade Gradient -->
          <div
            v-if="hasMultiplePages"
            class="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-stone-100 to-transparent z-[5] pointer-events-none hidden lg:block"
          />

          <!-- Right Fade Gradient -->
          <div
            v-if="hasMultiplePages"
            class="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-stone-100 to-transparent z-[5] pointer-events-none hidden lg:block"
          />

          <!-- Review Cards -->
          <TransitionGroup
            name="review-slide"
            tag="div"
            class="grid gap-8 md:grid-cols-3 auto-rows-fr"
          >
            <div
              v-for="review in displayedReviews"
              :key="review.id"
              class="rounded-2xl bg-white p-8 shadow-sm border border-stone-100/50 flex flex-col min-h-[280px]"
            >
              <div class="flex items-center gap-1 text-theme-primary mb-4">
                <UIcon
                  v-for="i in 5"
                  :key="i"
                  name="i-heroicons-star-solid"
                  class="w-5 h-5"
                  :class="i <= review.rating ? 'opacity-100' : 'opacity-30'"
                />
              </div>
              <p
                class="text-stone-600 mb-6 italic leading-relaxed flex-1 line-clamp-4"
              >
                "{{ review.comment }}"
              </p>
              <div class="flex items-center gap-4">
                <div
                  class="h-10 w-10 rounded-full bg-stone-200 flex items-center justify-center font-bold text-stone-500 flex-shrink-0"
                >
                  {{ review.authorName.charAt(0).toUpperCase() }}
                </div>
                <div>
                  <p class="font-bold text-stone-900 text-sm">
                    {{ review.authorName }}
                  </p>
                  <p class="text-xs text-stone-400">Customer</p>
                </div>
              </div>
            </div>
          </TransitionGroup>
        </div>

        <!-- Mobile Navigation -->
        <div
          v-if="hasMultiplePages"
          class="flex justify-center gap-3 mt-8 lg:hidden"
        >
          <UButton
            icon="i-heroicons-chevron-left"
            color="neutral"
            variant="outline"
            size="md"
            @click="prev"
          />
          <UButton
            icon="i-heroicons-chevron-right"
            color="neutral"
            variant="outline"
            size="md"
            @click="next"
          />
        </div>
      </div>

      <div v-else class="text-center py-12">
        <p class="text-stone-500">No reviews yet</p>
      </div>

      <!-- Write Review CTA -->
      <div class="text-center mt-12">
        <UButton
          to="/write-review"
          color="primary"
          size="lg"
          icon="i-heroicons-pencil-square"
        >
          Write a Review
        </UButton>
      </div>
    </div>
  </section>
</template>

<style scoped>
.review-slide-move,
.review-slide-enter-active,
.review-slide-leave-active {
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.review-slide-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.review-slide-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

.review-slide-leave-active {
  position: absolute;
}
</style>
