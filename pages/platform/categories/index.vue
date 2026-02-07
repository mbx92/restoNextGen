<script setup lang="ts">
definePageMeta({
  layout: "platform",
  middleware: ["platform-auth"],
});

interface FeatureCategory {
  id: string;
  code: string;
  name: string;
  description: string | null;
  icon: string | null;
  isActive: boolean;
  sortOrder: number;
  _count?: {
    features: number;
  };
}

const { data: categories, refresh: refreshCategories } = await useFetch<
  FeatureCategory[]
>("/api/platform/categories");

const isCategoryModalOpen = ref(false);
const editingCategory = ref<FeatureCategory | null>(null);

const categoryForm = ref({
  code: "",
  name: "",
  description: "",
  icon: "",
  sortOrder: 0,
  isActive: true,
});

const toast = useToast();
const { confirm } = useConfirmDialog();

const openCreateCategoryModal = () => {
  editingCategory.value = null;
  categoryForm.value = {
    code: "",
    name: "",
    description: "",
    icon: "",
    sortOrder: 0,
    isActive: true,
  };
  isCategoryModalOpen.value = true;
};

const openEditCategoryModal = (category: FeatureCategory) => {
  editingCategory.value = category;
  categoryForm.value = {
    code: category.code,
    name: category.name,
    description: category.description || "",
    icon: category.icon || "",
    sortOrder: category.sortOrder,
    isActive: category.isActive,
  };
  isCategoryModalOpen.value = true;
};

const saveCategory = async () => {
  try {
    if (editingCategory.value) {
      // Update
      await $fetch(`/api/platform/categories/${editingCategory.value.id}`, {
        method: "PATCH",
        body: categoryForm.value,
      });
      toast.add({
        title: "Success",
        description: "Category updated successfully",
        color: "success",
      });
    } else {
      // Create
      await $fetch("/api/platform/categories", {
        method: "POST",
        body: categoryForm.value,
      });
      toast.add({
        title: "Success",
        description: "Category created successfully",
        color: "success",
      });
    }
    await refreshCategories();
    isCategoryModalOpen.value = false;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to save category";
    toast.add({
      title: "Error",
      description: errorMessage,
      color: "error",
    });
  }
};

const deleteCategory = async (category: FeatureCategory) => {
  const confirmed = await confirm({
    title: "Delete Category",
    message: `Are you sure you want to delete "${category.name}"? This action cannot be undone.`,
    confirmText: "Delete",
    cancelText: "Cancel",
  });

  if (!confirmed) {
    return;
  }

  try {
    await $fetch(`/api/platform/categories/${category.id}`, {
      method: "DELETE",
    });
    toast.add({
      title: "Success",
      description: "Category deleted successfully",
      color: "success",
    });
    await refreshCategories();
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to delete category";
    toast.add({
      title: "Error",
      description: errorMessage,
      color: "error",
    });
  }
};

const toggleCategoryActive = async (category: FeatureCategory) => {
  try {
    await $fetch(`/api/platform/categories/${category.id}`, {
      method: "PATCH",
      body: {
        isActive: !category.isActive,
      },
    });
    toast.add({
      title: "Success",
      description: `Category ${!category.isActive ? "activated" : "deactivated"}`,
      color: "success",
    });
    await refreshCategories();
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to update category";
    toast.add({
      title: "Error",
      description: errorMessage,
      color: "error",
    });
  }
};
</script>

<template>
  <div>
    <div class="mb-8">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Category Management</h1>
          <p class="mt-2 text-gray-600">
            Organize features into categories for better organization
          </p>
        </div>

        <div class="flex items-center gap-3">
          <NuxtLink to="/platform/features">
            <UButton color="neutral" variant="outline">
              <template #leading>
                <UIcon name="i-lucide-arrow-left" />
              </template>
              Back to Features
            </UButton>
          </NuxtLink>

          <!-- Create Category Modal -->
          <UModal
            v-model:open="isCategoryModalOpen"
            :title="editingCategory ? 'Edit Category' : 'Create Category'"
          >
            <UButton color="primary" @click="openCreateCategoryModal">
              <template #leading>
                <UIcon name="i-lucide-plus" />
              </template>
              New Category
            </UButton>

            <template #body>
              <div class="space-y-4">
                <UInput
                  v-model="categoryForm.code"
                  label="Category Code"
                  placeholder="branding"
                  helper="Lowercase, no spaces (e.g., branding, analytics)"
                  class="w-full"
                />
                <UInput
                  v-model="categoryForm.name"
                  label="Category Name"
                  placeholder="Branding"
                  class="w-full"
                />
                <UInput
                  v-model="categoryForm.description"
                  label="Description"
                  placeholder="Branding and customization features"
                  class="w-full"
                />
                <UInput
                  v-model="categoryForm.icon"
                  label="Icon (optional)"
                  placeholder="i-lucide-palette"
                  class="w-full"
                />
                <UInput
                  v-model.number="categoryForm.sortOrder"
                  type="number"
                  label="Sort Order"
                  class="w-full"
                />
                <div class="flex items-center gap-2">
                  <USwitch v-model="categoryForm.isActive" />
                  <label class="text-sm font-medium">Active</label>
                </div>
              </div>
            </template>

            <template #footer>
              <div class="flex justify-end gap-2">
                <UButton
                  color="neutral"
                  variant="ghost"
                  @click="isCategoryModalOpen = false"
                >
                  Cancel
                </UButton>
                <UButton color="primary" @click="saveCategory">
                  {{ editingCategory ? "Update" : "Create" }}
                </UButton>
              </div>
            </template>
          </UModal>
        </div>
      </div>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <UCard>
        <div class="flex items-center gap-4">
          <div class="rounded-lg bg-primary-100 p-3">
            <UIcon name="i-lucide-layers" class="w-6 h-6 text-primary-700" />
          </div>
          <div>
            <p class="text-sm text-gray-600">Total Categories</p>
            <p class="text-2xl font-bold">{{ categories?.length || 0 }}</p>
          </div>
        </div>
      </UCard>

      <UCard>
        <div class="flex items-center gap-4">
          <div class="rounded-lg bg-success-100 p-3">
            <UIcon
              name="i-lucide-check-circle"
              class="w-6 h-6 text-success-700"
            />
          </div>
          <div>
            <p class="text-sm text-gray-600">Active Categories</p>
            <p class="text-2xl font-bold">
              {{ categories?.filter((c) => c.isActive).length || 0 }}
            </p>
          </div>
        </div>
      </UCard>

      <UCard>
        <div class="flex items-center gap-4">
          <div class="rounded-lg bg-info-100 p-3">
            <UIcon name="i-lucide-grid-3x3" class="w-6 h-6 text-info-700" />
          </div>
          <div>
            <p class="text-sm text-gray-600">Total Features</p>
            <p class="text-2xl font-bold">
              {{
                categories?.reduce(
                  (sum, c) => sum + (c._count?.features || 0),
                  0,
                ) || 0
              }}
            </p>
          </div>
        </div>
      </UCard>
    </div>

    <!-- Categories Table -->
    <UCard>
      <template #header>
        <h2 class="text-xl font-semibold">All Categories</h2>
      </template>

      <ClientOnly>
        <UTable
          :data="categories || []"
          :columns="[
            { accessorKey: 'name', header: 'Name' },
            { accessorKey: 'code', header: 'Code' },
            { accessorKey: 'description', header: 'Description' },
            { accessorKey: '_count', header: 'Features' },
            { accessorKey: 'sortOrder', header: 'Sort' },
            { accessorKey: 'isActive', header: 'Status' },
            { accessorKey: 'actions', header: '' },
          ]"
        >
          <template #name-cell="{ row }">
            <div class="flex items-center gap-2">
              <UIcon
                v-if="row.original.icon"
                :name="row.original.icon"
                class="w-4 h-4"
              />
              <span class="font-medium">{{ row.original.name }}</span>
            </div>
          </template>

          <template #code-cell="{ row }">
            <code class="text-xs bg-gray-100 px-2 py-1 rounded">
              {{ row.original.code }}
            </code>
          </template>

          <template #description-cell="{ row }">
            <span class="text-sm text-gray-600">
              {{ row.original.description || "-" }}
            </span>
          </template>

          <template #_count-cell="{ row }">
            <UBadge color="neutral" variant="subtle">
              {{ row.original._count?.features || 0 }}
            </UBadge>
          </template>

          <template #sortOrder-cell="{ row }">
            <span class="text-sm text-gray-600">
              {{ row.original.sortOrder }}
            </span>
          </template>

          <template #isActive-cell="{ row }">
            <USwitch
              :model-value="row.original.isActive"
              @update:model-value="toggleCategoryActive(row.original)"
            />
          </template>

          <template #actions-cell="{ row }">
            <div class="flex items-center gap-2 justify-end">
              <UButton
                color="neutral"
                variant="ghost"
                size="xs"
                @click="openEditCategoryModal(row.original)"
              >
                <template #leading>
                  <UIcon name="i-lucide-pencil" class="w-4 h-4" />
                </template>
                Edit
              </UButton>
              <UButton
                color="error"
                variant="ghost"
                size="xs"
                :disabled="(row.original._count?.features || 0) > 0"
                @click="deleteCategory(row.original)"
              >
                <template #leading>
                  <UIcon name="i-lucide-trash-2" class="w-4 h-4" />
                </template>
                Delete
              </UButton>
            </div>
          </template>
        </UTable>
        <template #fallback>
          <div class="p-4 text-center text-gray-500">Loading categories...</div>
        </template>
      </ClientOnly>
    </UCard>
  </div>
</template>
