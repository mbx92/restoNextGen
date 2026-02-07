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

interface Feature {
  id: string;
  code: string;
  name: string;
  description: string | null;
  categoryId: string | null;
  category?: FeatureCategory | null;
  isActive: boolean;
  sortOrder: number;
  _count?: {
    planFeatures: number;
    tenantOverrides: number;
  };
}

const { data: features, refresh: refreshFeatures } = await useFetch<Feature[]>(
  "/api/platform/features",
);

const { data: categories } = await useFetch<FeatureCategory[]>(
  "/api/platform/categories",
);

const categoryOptions = computed(() => {
  return (categories.value || []).map((cat) => ({
    label: cat.name,
    value: cat.id,
  }));
});

const isModalOpen = ref(false);
const editingFeature = ref<Feature | null>(null);
const isDeleting = ref(false);

const featureForm = ref({
  code: "",
  name: "",
  description: "",
  categoryId: "",
  sortOrder: 0,
  isActive: true,
});

const toast = useToast();
const { confirm } = useConfirmDialog();

const openEditModal = (feature: Feature) => {
  editingFeature.value = feature;
  featureForm.value = {
    code: feature.code,
    name: feature.name,
    description: feature.description || "",
    categoryId: feature.categoryId || "",
    sortOrder: feature.sortOrder,
    isActive: feature.isActive,
  };
  isModalOpen.value = true;
};

const saveFeature = async () => {
  try {
    if (editingFeature.value) {
      // Update
      await $fetch(`/api/platform/features/${editingFeature.value.id}`, {
        method: "PATCH",
        body: {
          name: featureForm.value.name,
          description: featureForm.value.description,
          categoryId: featureForm.value.categoryId || null,
          sortOrder: featureForm.value.sortOrder,
          isActive: featureForm.value.isActive,
        },
      });
      toast.add({
        title: "Success",
        description: "Feature updated successfully",
        color: "success",
      });
    } else {
      // Create
      await $fetch("/api/platform/features", {
        method: "POST",
        body: featureForm.value,
      });
      toast.add({
        title: "Success",
        description: "Feature created successfully",
        color: "success",
      });
      // Reset form after create
      featureForm.value = {
        code: "",
        name: "",
        description: "",
        categoryId: "",
        sortOrder: 0,
        isActive: true,
      };
    }
    await refreshFeatures();
    isModalOpen.value = false;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to save feature";
    toast.add({
      title: "Error",
      description: errorMessage,
      color: "error",
    });
  }
};

const deleteFeature = async (feature: Feature) => {
  const confirmed = await confirm({
    title: "Delete Feature",
    message: `Are you sure you want to delete "${feature.name}"? This will remove it from all plans.`,
    confirmText: "Delete",
    cancelText: "Cancel",
  });

  if (!confirmed) {
    return;
  }

  try {
    isDeleting.value = true;
    await $fetch(`/api/platform/features/${feature.id}`, {
      method: "DELETE",
    });
    toast.add({
      title: "Success",
      description: "Feature deleted successfully",
      color: "success",
    });
    await refreshFeatures();
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to delete feature";
    toast.add({
      title: "Error",
      description: errorMessage,
      color: "error",
    });
  } finally {
    isDeleting.value = false;
  }
};

const getCategoryColor = (
  category: FeatureCategory | null | undefined,
):
  | "primary"
  | "error"
  | "secondary"
  | "neutral"
  | "success"
  | "info"
  | "warning" => {
  if (!category) return "neutral";

  const colors: Record<
    string,
    | "primary"
    | "error"
    | "secondary"
    | "neutral"
    | "success"
    | "info"
    | "warning"
  > = {
    branding: "secondary",
    analytics: "primary",
    integrations: "info",
    support: "success",
    advanced: "warning",
    general: "neutral",
  };
  return colors[category.code] || "neutral";
};

// Group features by category
const featuresByCategory = computed(() => {
  const grouped: Record<
    string,
    { category: FeatureCategory | null; features: Feature[] }
  > = {};
  features.value?.forEach((feature) => {
    const categoryName = feature.category?.name || "Uncategorized";
    if (!grouped[categoryName]) {
      grouped[categoryName] = {
        category: feature.category || null,
        features: [],
      };
    }
    grouped[categoryName]?.features.push(feature);
  });
  return grouped;
});
</script>

<template>
  <div>
    <div class="mb-8">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Feature Management</h1>
          <p class="mt-2 text-gray-600">
            Manage available features across the platform
          </p>
        </div>

        <div class="flex items-center gap-3">
          <NuxtLink to="/platform/categories">
            <UButton color="neutral" variant="outline">
              <template #leading>
                <UIcon name="i-lucide-layers" />
              </template>
              Manage Categories
            </UButton>
          </NuxtLink>

          <!-- Create Feature Modal -->
          <UModal title="Create Feature">
            <UButton color="primary">
              <template #leading>
                <UIcon name="i-lucide-plus" />
              </template>
              New Feature
            </UButton>

            <template #body>
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium mb-1"
                    >Feature Code</label
                  >
                  <UInput
                    v-model="featureForm.code"
                    placeholder="CUSTOM_DOMAIN"
                    class="w-full mb-4"
                  />
                  <p class="text-xs text-gray-500">
                    Uppercase, underscore-separated (e.g., CUSTOM_DOMAIN)
                  </p>
                </div>

                <div>
                  <label class="block text-sm font-medium mb-1"
                    >Feature Name</label
                  >
                  <UInput
                    v-model="featureForm.name"
                    placeholder="Custom Domain"
                    class="w-full mb-4"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium mb-1"
                    >Description</label
                  >
                  <UTextarea
                    v-model="featureForm.description"
                    placeholder="Allow tenants to use their own domain"
                    class="w-full mb-4"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium mb-1">Category</label>
                  <USelect
                    v-model="featureForm.categoryId"
                    :items="categoryOptions"
                    placeholder="Select category"
                    class="w-full mb-4"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium mb-1"
                    >Sort Order</label
                  >
                  <UInput
                    v-model.number="featureForm.sortOrder"
                    type="number"
                    class="w-full mb-4"
                  />
                </div>

                <div class="flex items-center gap-2">
                  <UCheckbox v-model="featureForm.isActive" />
                  <label class="text-sm">Active</label>
                </div>
              </div>
            </template>

            <template #footer="{ close }">
              <div class="flex justify-end gap-2">
                <UButton color="neutral" variant="ghost" @click="close">
                  Cancel
                </UButton>
                <UButton color="primary" @click="saveFeature"> Create </UButton>
              </div>
            </template>
          </UModal>
        </div>
      </div>
    </div>

    <!-- Stats -->
    <div class="grid gap-6 sm:grid-cols-3 mb-8">
      <UCard>
        <div class="flex items-center gap-4">
          <div class="rounded-lg bg-primary-100 p-3">
            <UIcon name="i-lucide-sparkles" class="w-6 h-6 text-primary-700" />
          </div>
          <div>
            <p class="text-sm text-gray-600">Total Features</p>
            <p class="text-2xl font-bold">{{ features?.length || 0 }}</p>
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
            <p class="text-sm text-gray-600">Active Features</p>
            <p class="text-2xl font-bold">
              {{ features?.filter((f) => f.isActive).length || 0 }}
            </p>
          </div>
        </div>
      </UCard>

      <UCard>
        <div class="flex items-center gap-4">
          <div class="rounded-lg bg-info-100 p-3">
            <UIcon name="i-lucide-layers" class="w-6 h-6 text-info-700" />
          </div>
          <div>
            <p class="text-sm text-gray-600">Categories</p>
            <p class="text-2xl font-bold">
              {{ Object.keys(featuresByCategory).length }}
            </p>
          </div>
        </div>
      </UCard>
    </div>

    <!-- Features by Category -->
    <div class="space-y-6">
      <div
        v-for="(categoryData, categoryName) in featuresByCategory"
        :key="categoryName"
      >
        <UCard>
          <template #header>
            <div class="flex items-center gap-3">
              <UBadge
                :color="getCategoryColor(categoryData.category)"
                size="md"
              >
                {{ categoryName.toUpperCase() }}
              </UBadge>
              <span class="text-sm text-gray-500">
                {{ categoryData.features.length }} features
              </span>
            </div>
          </template>

          <div class="space-y-3">
            <div
              v-for="feature in categoryData.features"
              :key="feature.id"
              class="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
            >
              <div class="flex-1">
                <div class="flex items-center gap-3">
                  <h3 class="font-semibold text-gray-900">
                    {{ feature.name }}
                  </h3>
                  <UBadge
                    v-if="!feature.isActive"
                    color="neutral"
                    variant="subtle"
                    size="xs"
                  >
                    Inactive
                  </UBadge>
                </div>
                <p class="text-sm text-gray-600 mt-1">
                  Code:
                  <code class="text-xs bg-gray-100 px-1 rounded">{{
                    feature.code
                  }}</code>
                </p>
                <p
                  v-if="feature.description"
                  class="text-sm text-gray-500 mt-1"
                >
                  {{ feature.description }}
                </p>
                <div class="flex items-center gap-4 mt-2 text-xs text-gray-500">
                  <span>Used in {{ feature._count?.planFeatures }} plans</span>
                  <span>{{ feature._count?.tenantOverrides }} overrides</span>
                </div>
              </div>

              <div class="flex items-center gap-2">
                <UButton
                  color="primary"
                  variant="ghost"
                  size="sm"
                  @click="openEditModal(feature)"
                >
                  <template #leading>
                    <UIcon name="i-lucide-pencil" />
                  </template>
                  Edit
                </UButton>
                <UButton
                  color="error"
                  variant="ghost"
                  size="sm"
                  :disabled="isDeleting"
                  @click="deleteFeature(feature)"
                >
                  <template #leading>
                    <UIcon name="i-lucide-trash-2" />
                  </template>
                  Delete
                </UButton>
              </div>
            </div>
          </div>
        </UCard>
      </div>
    </div>

    <!-- Edit Modal (controlled programmatically) -->
    <UModal v-model:open="isModalOpen" title="Edit Feature">
      <!-- Empty default slot for programmatic control -->
      <template #default />

      <template #body>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1">Feature Code</label>
            <UInput
              v-model="featureForm.code"
              placeholder="CUSTOM_DOMAIN"
              class="w-full mb-4"
              disabled
            />
            <p class="text-xs text-gray-500">
              Code cannot be changed after creation
            </p>
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Feature Name</label>
            <UInput
              v-model="featureForm.name"
              placeholder="Custom Domain"
              class="w-full mb-4"
            />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Description</label>
            <UTextarea
              v-model="featureForm.description"
              placeholder="Allow tenants to use their own domain"
              class="w-full mb-4"
            />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Category</label>
            <USelect
              v-model="featureForm.categoryId"
              :items="categoryOptions"
              placeholder="Select category"
              class="w-full mb-4"
            />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Sort Order</label>
            <UInput
              v-model.number="featureForm.sortOrder"
              type="number"
              class="w-full mb-4"
            />
          </div>

          <div class="flex items-center gap-2">
            <UCheckbox v-model="featureForm.isActive" />
            <label class="text-sm">Active</label>
          </div>
        </div>
      </template>

      <template #footer="{ close }">
        <div class="flex justify-end gap-2">
          <UButton color="neutral" variant="ghost" @click="close">
            Cancel
          </UButton>
          <UButton color="primary" @click="saveFeature"> Update </UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>
