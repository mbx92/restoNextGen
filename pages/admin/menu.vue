<script setup lang="ts">
import { computed } from "vue";

definePageMeta({
  layout: "admin",
  middleware: ["admin-auth"],
});

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface MenuItem {
  id: string;
  categoryId: string | null;
  name: string;
  description: string | null;
  price: number;
  photoUrl: string | null;
  isAvailable: boolean;
  isFeatured: boolean;
  sortOrder: number;
  category: Category | null;
}

const {
  data: categories,
  refresh: refreshCategories,
  error: categoriesError,
} = await useFetch<Category[]>("/api/admin/categories");
const { data: items, refresh: refreshItems } = await useFetch<MenuItem[]>(
  "/api/admin/menu/items",
);

// Debug: Log categories data
console.log("Categories data:", categories.value);
console.log("Categories error:", categoriesError.value);

// Transform categories to SelectMenu format
const categoryOptions = computed(() => {
  return (categories.value || []).map((c) => ({
    label: c.name,
    value: c.id,
  }));
});

const isModalOpen = ref(false);
const editingItem = ref<MenuItem | null>(null);
const itemForm = ref({
  categoryId: "",
  name: "",
  description: "",
  price: 0,
  photoUrl: "",
  isAvailable: true,
  isFeatured: false,
  sortOrder: 0,
});

const openCreateModal = () => {
  editingItem.value = null;
  itemForm.value = {
    categoryId: "",
    name: "",
    description: "",
    price: 0,
    photoUrl: "",
    isAvailable: true,
    isFeatured: false,
    sortOrder: 0,
  };
  isModalOpen.value = true;
};

const openEditModal = (item: MenuItem) => {
  editingItem.value = item;
  itemForm.value = {
    categoryId: item.categoryId || "",
    name: item.name,
    description: item.description || "",
    price: item.price,
    photoUrl: item.photoUrl || "",
    isAvailable: item.isAvailable,
    isFeatured: item.isFeatured,
    sortOrder: item.sortOrder,
  };
  isModalOpen.value = true;
};

const saveItem = async () => {
  try {
    if (editingItem.value) {
      await $fetch(`/api/admin/menu/${editingItem.value.id}`, {
        method: "PATCH",
        body: itemForm.value,
      });
    } else {
      await $fetch("/api/admin/menu/items", {
        method: "POST",
        body: itemForm.value,
      });
    }
    await refreshItems();
    isModalOpen.value = false;
  } catch (error) {
    console.error("Failed to save menu item:", error);
  }
};

const deleteItem = async (item: MenuItem) => {
  if (!confirm(`Delete "${item.name}"?`)) return;

  try {
    await $fetch(`/api/admin/menu/${item.id}`, {
      method: "DELETE",
    });
    await refreshItems();
  } catch (error) {
    console.error("Failed to delete item:", error);
  }
};

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);
};

const groupedItems = computed(() => {
  if (!items.value) return {};
  return items.value.reduce(
    (acc, item) => {
      const key = item.category?.name || "Uncategorized";
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    },
    {} as Record<string, MenuItem[]>,
  );
});
</script>

<template>
  <div>
    <div class="mb-8 flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-serif font-bold text-stone-900">Menu Items</h1>
        <p class="mt-2 text-stone-600">Manage your menu items</p>
        <!-- Debug info -->
        <p v-if="categoriesError" class="text-red-600 text-sm mt-1">
          Error loading categories: {{ categoriesError }}
        </p>
        <p class="text-xs text-stone-400 mt-1">
          Categories loaded: {{ categories?.length || 0 }}
        </p>
      </div>
      <div class="flex gap-2">
        <UButton
          to="/admin/categories"
          variant="outline"
          color="neutral"
          icon="i-heroicons-folder"
        >
          Manage Categories
        </UButton>
        <UButton
          color="primary"
          icon="i-heroicons-plus"
          @click="openCreateModal"
        >
          Add Menu Item
        </UButton>
      </div>
    </div>

    <!-- Grouped by Category -->
    <div v-if="items && items.length > 0" class="space-y-6">
      <div
        v-for="(categoryItems, categoryName) in groupedItems"
        :key="categoryName"
      >
        <h2 class="text-xl font-semibold text-stone-900 mb-4">
          {{ categoryName }}
        </h2>
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <UCard
            v-for="item in categoryItems"
            :key="item.id"
            class="hover:shadow-lg transition-shadow"
          >
            <div class="space-y-3">
              <div
                v-if="item.photoUrl"
                class="w-full h-40 bg-stone-200 rounded-lg overflow-hidden"
              >
                <img
                  :src="item.photoUrl"
                  :alt="item.name"
                  class="w-full h-full object-cover"
                />
              </div>
              <div
                v-else
                class="w-full h-40 bg-stone-100 rounded-lg flex items-center justify-center"
              >
                <UIcon
                  name="i-heroicons-photo"
                  class="w-12 h-12 text-stone-300"
                />
              </div>

              <div>
                <div class="flex items-start justify-between gap-2">
                  <h3 class="font-semibold text-stone-900">{{ item.name }}</h3>
                  <div class="flex gap-1">
                    <UBadge v-if="item.isFeatured" color="primary" size="xs">
                      Featured
                    </UBadge>
                    <UBadge v-if="!item.isAvailable" color="neutral" size="xs">
                      Unavailable
                    </UBadge>
                  </div>
                </div>
                <p
                  v-if="item.description"
                  class="text-sm text-stone-600 mt-1 line-clamp-2"
                >
                  {{ item.description }}
                </p>
                <p class="text-lg font-bold text-amber-700 mt-2">
                  {{ formatPrice(item.price) }}
                </p>
              </div>

              <div class="flex gap-2 pt-2">
                <UButton
                  variant="outline"
                  color="neutral"
                  size="sm"
                  icon="i-heroicons-pencil"
                  class="flex-1"
                  @click="openEditModal(item)"
                >
                  Edit
                </UButton>
                <UButton
                  variant="outline"
                  color="error"
                  size="sm"
                  icon="i-heroicons-trash"
                  @click="deleteItem(item)"
                >
                  Delete
                </UButton>
              </div>
            </div>
          </UCard>
        </div>
      </div>
    </div>

    <UCard v-else>
      <div class="py-12 text-center text-stone-500">
        <UIcon
          name="i-heroicons-document-text"
          class="w-16 h-16 mx-auto mb-4 text-stone-300"
        />
        <p class="text-lg font-medium">No menu items yet</p>
        <p class="text-sm mt-2">
          Start by creating categories, then add your menu items
        </p>
        <div class="mt-6 flex gap-3 justify-center">
          <UButton to="/admin/categories" variant="outline" color="neutral">
            Create Categories
          </UButton>
          <UButton color="primary" @click="openCreateModal">
            Add Menu Item
          </UButton>
        </div>
      </div>
    </UCard>

    <!-- Modal -->
    <UModal
      v-model:open="isModalOpen"
      :title="editingItem ? 'Edit Menu Item' : 'New Menu Item'"
      description="Manage menu item details"
    >
      <template #body>
        <form class="space-y-4" @submit.prevent="saveItem">
          <UFormField label="Name" required>
            <UInput
              v-model="itemForm.name"
              placeholder="Salmon Soup Special"
              class="w-full"
            />
          </UFormField>

          <UFormField label="Description">
            <UTextarea
              v-model="itemForm.description"
              placeholder="Fresh salmon in savory broth..."
              :rows="6"
              class="w-full"
            />
          </UFormField>

          <div class="grid grid-cols-2 gap-4">
            <UFormField label="Price (IDR)" required>
              <UInput
                v-model.number="itemForm.price"
                type="number"
                placeholder="50000"
                class="w-full"
              />
            </UFormField>

            <UFormField label="Category">
              <USelectMenu
                v-model="itemForm.categoryId"
                :items="categoryOptions"
                value-key="value"
                placeholder="Select a category"
                class="w-full"
              />
            </UFormField>
          </div>

          <UFormField label="Photo URL">
            <UInput
              v-model="itemForm.photoUrl"
              placeholder="https://example.com/image.jpg"
              class="w-full"
            />
          </UFormField>

          <div class="grid grid-cols-2 gap-4">
            <UFormField label="Sort Order">
              <UInput
                v-model.number="itemForm.sortOrder"
                type="number"
                class="w-full"
              />
            </UFormField>

            <UFormField label="Availability">
              <div class="flex items-center gap-2 h-10">
                <USwitch v-model="itemForm.isAvailable" />
                <span class="text-sm text-stone-600">
                  {{ itemForm.isAvailable ? "Available" : "Unavailable" }}
                </span>
              </div>
            </UFormField>
          </div>

          <UFormField label="Featured on Landing Page">
            <div class="flex items-center gap-2 h-10">
              <USwitch v-model="itemForm.isFeatured" />
              <span class="text-sm text-stone-600">
                {{ itemForm.isFeatured ? "Featured" : "Not Featured" }}
              </span>
            </div>
          </UFormField>
        </form>
      </template>

      <template #footer="{ close }">
        <div class="flex justify-end gap-2">
          <UButton variant="outline" color="neutral" @click="close">
            Cancel
          </UButton>
          <UButton color="primary" @click="saveItem"> Save Item </UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>
