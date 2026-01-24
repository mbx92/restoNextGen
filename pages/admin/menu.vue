<script setup lang="ts">
definePageMeta({
  layout: "admin",
});

const { data: categories } = await useFetch("/api/admin/menu/categories");
const { data: items } = await useFetch("/api/admin/menu/items");
</script>

<template>
  <div>
    <div class="mb-8">
      <h1 class="text-3xl font-serif font-bold text-stone-900">
        Menu Management
      </h1>
      <p class="mt-2 text-stone-600">Manage menu categories and items</p>
    </div>

    <div class="mb-6 flex gap-4">
      <UButton
        color="neutral"
        class="!bg-amber-700 !text-white hover:!bg-amber-800"
      >
        Add Category
      </UButton>
      <UButton
        color="neutral"
        variant="outline"
        class="!border-stone-300 !text-stone-700 hover:!bg-stone-50"
      >
        Add Menu Item
      </UButton>
    </div>

    <!-- Categories -->
    <div class="mb-8 rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
      <h2 class="mb-4 text-xl font-semibold text-stone-900">Categories</h2>
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="cat in categories"
          :key="cat.id"
          class="rounded-lg border border-stone-200 p-4 hover:border-amber-300 hover:bg-amber-50"
        >
          <p class="font-semibold text-stone-900">{{ cat.name }}</p>
          <p class="text-sm text-stone-500">{{ cat._count.items }} items</p>
        </div>
      </div>
      <div
        v-if="!categories || categories.length === 0"
        class="py-8 text-center text-stone-500"
      >
        No categories
      </div>
    </div>

    <!-- Menu Items -->
    <div class="rounded-xl border border-stone-200 bg-white shadow-sm">
      <div class="p-6">
        <h2 class="text-xl font-semibold text-stone-900">Menu Items</h2>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="border-y border-stone-200 bg-stone-50">
            <tr>
              <th
                class="px-6 py-3 text-left text-sm font-semibold text-stone-700"
              >
                Name
              </th>
              <th
                class="px-6 py-3 text-left text-sm font-semibold text-stone-700"
              >
                Category
              </th>
              <th
                class="px-6 py-3 text-left text-sm font-semibold text-stone-700"
              >
                Price
              </th>
              <th
                class="px-6 py-3 text-left text-sm font-semibold text-stone-700"
              >
                Status
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-stone-100">
            <tr v-for="item in items" :key="item.id" class="hover:bg-stone-50">
              <td class="px-6 py-4">
                <p class="font-medium text-stone-900">{{ item.name }}</p>
                <p class="text-sm text-stone-500">
                  {{ item.description || "-" }}
                </p>
              </td>
              <td class="px-6 py-4 text-sm text-stone-700">
                {{ item.category?.name || "-" }}
              </td>
              <td class="px-6 py-4 text-sm font-medium text-stone-900">
                Rp {{ item.price.toLocaleString("id-ID") }}
              </td>
              <td class="px-6 py-4">
                <span
                  class="rounded-full px-3 py-1 text-xs font-medium"
                  :class="
                    item.isAvailable
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  "
                >
                  {{ item.isAvailable ? "Available" : "Unavailable" }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div
        v-if="!items || items.length === 0"
        class="py-12 text-center text-stone-500"
      >
        No menu items
      </div>
    </div>
  </div>
</template>
