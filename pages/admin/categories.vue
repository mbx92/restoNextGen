<script setup lang="ts">
definePageMeta({
  layout: "admin",
  middleware: ["admin-auth"],
});

interface Category {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  isActive: boolean;
  _count?: {
    items: number;
  };
}

const { data: categories, refresh } = await useFetch<Category[]>(
  "/api/admin/categories",
);

const isModalOpen = ref(false);
const editingCategory = ref<Category | null>(null);
const categoryForm = ref({
  name: "",
  slug: "",
  sortOrder: 0,
  isActive: true,
});

const openCreateModal = () => {
  editingCategory.value = null;
  categoryForm.value = {
    name: "",
    slug: "",
    sortOrder: 0,
    isActive: true,
  };
  isModalOpen.value = true;
};

const openEditModal = (category: Category) => {
  editingCategory.value = category;
  categoryForm.value = {
    name: category.name,
    slug: category.slug,
    sortOrder: category.sortOrder,
    isActive: category.isActive,
  };
  isModalOpen.value = true;
};

const saveCategory = async () => {
  try {
    if (editingCategory.value) {
      // Update
      await $fetch(`/api/admin/categories/${editingCategory.value.id}`, {
        method: "PATCH",
        body: categoryForm.value,
      });
    } else {
      // Create
      await $fetch("/api/admin/categories", {
        method: "POST",
        body: categoryForm.value,
      });
    }
    await refresh();
    isModalOpen.value = false;
  } catch (error) {
    console.error("Failed to save category:", error);
  }
};

const deleteCategory = async (category: Category) => {
  if (category._count && category._count.items > 0) {
    alert("Cannot delete category with menu items");
    return;
  }

  if (!confirm(`Delete category "${category.name}"?`)) return;

  try {
    await $fetch(`/api/admin/categories/${category.id}`, {
      method: "DELETE",
    });
    await refresh();
  } catch (error) {
    console.error("Failed to delete category:", error);
  }
};

// Auto-generate slug from name
watch(
  () => categoryForm.value.name,
  (newName) => {
    if (!editingCategory.value) {
      categoryForm.value.slug = newName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
    }
  },
);
</script>

<template>
  <div>
    <div class="mb-8 flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-serif font-bold text-stone-900">Categories</h1>
        <p class="mt-2 text-stone-600">Manage menu categories</p>
      </div>
      <UButton color="primary" icon="i-heroicons-plus" @click="openCreateModal">
        Add Category
      </UButton>
    </div>

    <UCard>
      <div v-if="categories && categories.length > 0" class="space-y-2">
        <div
          v-for="category in categories"
          :key="category.id"
          class="flex items-center justify-between p-4 rounded-lg border border-stone-200 hover:bg-stone-50"
        >
          <div class="flex-1">
            <div class="flex items-center gap-3">
              <h3 class="font-semibold text-stone-900">{{ category.name }}</h3>
              <UBadge v-if="!category.isActive" color="neutral"
                >Inactive</UBadge
              >
            </div>
            <p class="text-sm text-stone-500 mt-1">
              Slug: {{ category.slug }} · Sort: {{ category.sortOrder }} ·
              {{ category._count?.items || 0 }} items
            </p>
          </div>
          <div class="flex gap-2">
            <UButton
              variant="outline"
              color="neutral"
              size="sm"
              icon="i-heroicons-pencil"
              @click="openEditModal(category)"
            >
              Edit
            </UButton>
            <UButton
              variant="outline"
              color="error"
              size="sm"
              icon="i-heroicons-trash"
              :disabled="(category._count?.items || 0) > 0"
              @click="deleteCategory(category)"
            >
              Delete
            </UButton>
          </div>
        </div>
      </div>
      <div v-else class="py-12 text-center text-stone-500">
        No categories yet. Click "Add Category" to create one.
      </div>
    </UCard>

    <!-- Modal -->
    <UModal
      v-model:open="isModalOpen"
      title="New Category"
      description="Create a new menu category"
    >
      <template #body>
        <form class="space-y-4" @submit.prevent="saveCategory">
          <UFormField label="Name" required>
            <UInput
              v-model="categoryForm.name"
              placeholder="Main Dishes"
              class="w-full"
            />
          </UFormField>

          <UFormField label="Slug" required>
            <UInput
              v-model="categoryForm.slug"
              placeholder="main-dishes"
              class="w-full"
            />
            <template #help>
              <span class="text-xs text-stone-400">
                URL-friendly identifier (auto-generated from name)
              </span>
            </template>
          </UFormField>

          <UFormField label="Sort Order">
            <UInput
              v-model.number="categoryForm.sortOrder"
              type="number"
              class="w-full"
            />
            <template #help>
              <span class="text-xs text-stone-400">
                Lower numbers appear first
              </span>
            </template>
          </UFormField>

          <UFormField label="Status">
            <div class="flex items-center gap-2">
              <USwitch v-model="categoryForm.isActive" />
              <span class="text-sm text-stone-600">
                {{ categoryForm.isActive ? "Active" : "Inactive" }}
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
          <UButton color="primary" @click="saveCategory">
            Save Category
          </UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>
