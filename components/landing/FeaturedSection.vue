<script setup lang="ts">
const featuredItems = [
  {
    id: 1,
    name: "Signature Salmon Soup",
    description: "Fresh salmon in our secret savory broth with herbs.",
    price: "IDR 85.000",
    image:
      "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    tag: "Best Seller",
  },
  {
    id: 2,
    name: "Grilled Honey Prawns",
    description: "King prawns grilled with local honey and spices.",
    price: "IDR 120.000",
    image:
      "https://images.unsplash.com/photo-1516684732162-798a0062be99?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    tag: "Chef Choice",
  },
  {
    id: 3,
    name: "Spicy Sambal Calamari",
    description: "Crispy fried calamari tossed in house sambal.",
    price: "IDR 65.000",
    image:
      "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    tag: null,
  },
];
</script>

<template>
  <section id="menu" class="py-24 bg-white">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-16">
        <h2 class="text-3xl font-serif font-bold text-stone-900">
          Featured Favorites
        </h2>
        <p class="mt-4 text-stone-600">
          Curated dishes that defined our taste.
        </p>
      </div>

      <div class="grid gap-8 md:grid-cols-3">
        <div
          v-for="item in featuredItems"
          :key="item.id"
          class="group relative flex flex-col overflow-hidden rounded-2xl bg-stone-50 border border-stone-100 transition hover:shadow-lg hover:border-amber-200"
        >
          <div class="aspect-[4/3] w-full overflow-hidden bg-stone-200">
            <img
              :src="item.image"
              :alt="item.name"
              class="h-full w-full object-cover transition duration-500 group-hover:scale-110"
            />
            <span
              v-if="item.tag"
              class="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 text-xs font-bold uppercase tracking-wide text-amber-700 rounded-full shadow-sm"
            >
              {{ item.tag }}
            </span>
          </div>
          <div class="flex flex-1 flex-col p-6">
            <div class="flex justify-between items-start mb-2">
              <h3 class="text-lg font-bold text-stone-900">{{ item.name }}</h3>
              <p class="font-medium text-amber-700">{{ item.price }}</p>
            </div>
            <p class="text-sm text-stone-500 mb-6 flex-1">
              {{ item.description }}
            </p>
            <UButton
              color="stone"
              variant="outline"
              block
              class="rounded-xl border-stone-300 hover:bg-stone-800 hover:text-white hover:border-stone-800 transition-colors"
            >
              Add to Order
            </UButton>
          </div>
        </div>
      </div>

      <div class="mt-12 text-center">
        <UButton
          to="#"
          variant="link"
          class="text-stone-900 font-medium underline decoration-amber-500 underline-offset-4 hover:decoration-2"
        >
          Download Full Menu PDF
        </UButton>
      </div>
    </div>
  </section>
</template>
