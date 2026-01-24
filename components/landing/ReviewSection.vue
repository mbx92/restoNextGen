<script setup lang="ts">
const reviews = [
  {
    id: 1,
    author: "Sari W.",
    role: "Food Blogger",
    rating: 5,
    text: "I've travelled all over Indonesia, and this Salmon Soup is hands down the best. The freshness is unbelievable.",
    avatar: "S",
  },
  {
    id: 2,
    author: "Budi Santoso",
    role: "Local Guide",
    rating: 5,
    text: "Perfect spot for family lunch. Quiet atmosphere, amazing service, and the food speaks for itself.",
    avatar: "B",
  },
  {
    id: 3,
    author: "Jessica L.",
    role: "Regular",
    rating: 4,
    text: "The spicy calamari is to die for. Just the right amount of kick! Love the new renovation too.",
    avatar: "J",
  },
];
</script>

<template>
  <section id="reviews" class="py-24 bg-stone-100">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <h2
        class="text-3xl font-serif font-bold text-stone-900 text-center mb-16"
      >
        What Our Guests Say
      </h2>

      <div class="grid gap-8 md:grid-cols-3">
        <div
          v-for="review in reviews"
          :key="review.id"
          class="rounded-2xl bg-white p-8 shadow-sm border border-stone-100/50"
        >
          <div class="flex items-center gap-1 text-amber-400 mb-4">
            <UIcon
              v-for="i in 5"
              :key="i"
              name="i-heroicons-star-solid"
              class="w-5 h-5"
              :class="i <= review.rating ? 'opacity-100' : 'opacity-30'"
            />
          </div>
          <p class="text-stone-600 mb-6 italic leading-relaxed">
            "{{ review.text }}"
          </p>
          <div class="flex items-center gap-4 mt-auto">
            <div
              class="h-10 w-10 rounded-full bg-stone-200 flex items-center justify-center font-bold text-stone-500"
            >
              {{ review.avatar }}
            </div>
            <div>
              <p class="font-bold text-stone-900 text-sm">
                {{ review.author }}
              </p>
              <p class="text-xs text-stone-400">{{ review.role }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
