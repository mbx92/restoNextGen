<script setup lang="ts">
definePageMeta({
  layout: "admin",
  middleware: ["admin-auth"],
});

interface FeaturedMenuItem {
  id: string;
  menuItemId: string | null;
  name: string;
  description: string;
  price: number;
  imageUrl: string | null;
  sortOrder: number;
  isActive: boolean;
}

const { data: items, refresh } = await useFetch<FeaturedMenuItem[]>(
  "/api/admin/featured-menu",
);

const isModalOpen = ref(false);
const editingItem = ref<FeaturedMenuItem | null>(null);
const itemForm = ref({
  menuItemId: null as string | null,
  name: "",
  description: "",
  price: 0,
  imageUrl: "",
  sortOrder: 0,
  isActive: true,
});

const openCreateModal = () => {
  editingItem.value = null;
  itemForm.value = {
    menuItemId: null,
    name: "",
    description: "",
    price: 0,
    imageUrl: "",
    sortOrder: items.value?.length || 0,
    isActive: true,
  };
  isModalOpen.value = true;
};

const openEditModal = (item: FeaturedMenuItem) => {
  editingItem.value = item;
  itemForm.value = {
    menuItemId: item.menuItemId,
    name: item.name,
    description: item.description,
    price: item.price,
    imageUrl: item.imageUrl || "",
    sortOrder: item.sortOrder,
    isActive: item.isActive,
  };
  isModalOpen.value = true;
};

const saveItem = async () => {
  try {
    if (editingItem.value) {
      await $fetch(`/api/admin/featured-menu/${editingItem.value.id}`, {
        method: "PATCH",
        body: itemForm.value,
      });
    } else {
      await $fetch("/api/admin/featured-menu", {
        method: "POST",
        body: itemForm.value,
      });
    }
    await refresh();
    isModalOpen.value = false;
  } catch (error) {
    console.error("Failed to save item:", error);
  }
};

const deleteItem = async (id: string) => {
  if (!confirm("Are you sure you want to delete this featured item?")) return;

  try {
    await $fetch(`/api/admin/featured-menu/${id}`, {
      method: "DELETE",
    });
    await refresh();
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
</script>

<template>
  <div>
    <div class="mb-8 flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-serif font-bold text-stone-900">
          Featured Menu
        </h1>
        <p class="mt-2 text-stone-600">
          Manage items displayed on the landing page
        </p>
      </div>
      <UButton color="primary" icon="i-heroicons-plus" @click="openCreateModal">
        Add Featured Item
      </UButton>
    </div>

    <!-- Featured Items Grid -->
    <div v-if="items && items.length > 0" class="grid gap-6 md:grid-cols-3">
      <div
        v-for="item in items"
        :key="item.id"
        class="group relative flex flex-col overflow-hidden rounded-2xl bg-white border border-stone-200 transition hover:shadow-lg"
      >
        <div class="aspect-[4/3] w-full overflow-hidden bg-stone-200">
          <img
            v-if="item.imageUrl"
            :src="item.imageUrl"
            :alt="item.name"
            class="h-full w-full object-cover transition duration-500 group-hover:scale-110"
          />
          <div
            v-else
            class="h-full w-full flex items-center justify-center bg-stone-100"
          >
            <UIcon name="i-heroicons-photo" class="w-16 h-16 text-stone-300" />
          </div>
        </div>

        <div class="flex flex-1 flex-col p-6">
          <div class="flex items-start justify-between gap-2 mb-2">
            <h3 class="text-lg font-bold text-stone-900">{{ item.name }}</h3>
            <UBadge v-if="!item.isActive" color="neutral" size="xs">
              Inactive
            </UBadge>
          </div>
          <p class="text-sm text-stone-600 mb-2">{{ item.description }}</p>
          <p class="font-medium text-amber-700 mb-4">
            {{ formatPrice(item.price) }}
          </p>

          <div class="mt-auto flex gap-2">
            <UButton
              color="neutral"
              variant="outline"
              size="xs"
              icon="i-heroicons-pencil"
              @click="openEditModal(item)"
            >
              Edit
            </UButton>
            <UButton
              color="error"
              variant="outline"
              size="xs"
              icon="i-heroicons-trash"
              @click="deleteItem(item.id)"
            >
              Delete
            </UButton>
          </div>
        </div>

        <div
          class="absolute top-4 left-4 bg-white/90 backdrop-blur px-2 py-1 text-xs font-medium text-stone-600 rounded"
        >
          Order: {{ item.sortOrder }}
        </div>
      </div>
    </div>

    <div
      v-else
      class="text-center py-16 bg-stone-50 rounded-xl border-2 border-dashed border-stone-300"
    >
      <UIcon
        name="i-heroicons-sparkles"
        class="w-16 h-16 text-stone-400 mx-auto mb-4"
      />
      <h3 class="text-xl font-semibold text-stone-900 mb-2">
        No Featured Items Yet
      </h3>
      <p class="text-stone-600 mb-6">
        Add your first featured menu item to showcase on the landing page.
      </p>
      <UButton color="primary" @click="openCreateModal">
        Add Featured Item
      </UButton>
    </div>

    <!-- Modal -->
    <UModal
      v-model:open="isModalOpen"
      :title="editingItem ? 'Edit Featured Item' : 'New Featured Item'"
      description="Manage featured menu item details"
    >
      <template #body>
        <div class="space-y-4">
          <UFormField label="Name" required>
            <UInput
              v-model="itemForm.name"
              placeholder="Signature Salmon Soup"
              class="w-full"
            />
          </UFormField>

          <UFormField label="Description" required>
            <UTextarea
              v-model="itemForm.description"
              placeholder="Fresh salmon in our secret savory broth..."
              :rows="4"
              class="w-full"
            />
          </UFormField>

          <div class="grid grid-cols-2 gap-4">
            <UFormField label="Price (IDR)" required>
              <UInput
                v-model.number="itemForm.price"
                type="number"
                placeholder="85000"
                class="w-full"
              />
            </UFormField>

            <UFormField label="Sort Order">
              <UInput
                v-model.number="itemForm.sortOrder"
                type="number"
                placeholder="0"
                class="w-full"
              />
            </UFormField>
          </div>

          <UFormField label="Image URL" required>
            <UInput
              v-model="itemForm.imageUrl"
              placeholder="https://example.com/image.jpg"
              class="w-full"
            />
          </UFormField>

          <UFormField label="Status">
            <div class="flex items-center gap-3">
              <USwitch v-model="itemForm.isActive" />
              <span class="text-sm text-stone-600">
                {{ itemForm.isActive ? "Active" : "Inactive" }}
              </span>
            </div>
          </UFormField>
        </div>
      </template>

      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton
            color="neutral"
            variant="outline"
            @click="isModalOpen = false"
          >
            Cancel
          </UButton>
          <UButton color="primary" @click="saveItem"> Save Item </UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>
