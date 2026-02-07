<script setup lang="ts">
definePageMeta({
  layout: "platform",
  middleware: ["platform-auth"],
});

const route = useRoute();
const planId = route.params.id as string;

interface Plan {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

interface FeatureCategory {
  id: string;
  code: string;
  name: string;
  description: string | null;
  icon: string | null;
  isActive: boolean;
  sortOrder: number;
}

interface Feature {
  id: string;
  code: string;
  name: string;
  description: string | null;
  categoryId: string | null;
  category?: FeatureCategory | null;
}

interface PlanFeature {
  featureId: string;
  enabled: boolean;
  feature: Feature;
}

const { data: plan } = await useFetch<Plan>(`/api/platform/plans/${planId}`);
const { data: allFeatures } = await useFetch<Feature[]>(
  "/api/platform/features",
);

// Get current plan features
const { data: currentPlanFeatures, refresh: refreshPlanFeatures } =
  await useFetch<PlanFeature[]>(`/api/platform/plans/${planId}/features`);

const toast = useToast();
const isSaving = ref(false);

// Create a map of current plan features
const featureStates = ref<Record<string, boolean>>({});

// Initialize feature states
watch(
  [allFeatures, currentPlanFeatures],
  ([features, planFeatures]) => {
    if (!features || !planFeatures) return;

    const states: Record<string, boolean> = {};
    features.forEach((feature) => {
      const planFeature = planFeatures.find(
        (pf) => pf.featureId === feature.id,
      );
      states[feature.id] = planFeature?.enabled ?? false;
    });
    featureStates.value = states;
  },
  { immediate: true },
);

// Group features by category
const featuresByCategory = computed(() => {
  if (!allFeatures.value) return {};

  const grouped: Record<
    string,
    { category: FeatureCategory | null; features: Feature[] }
  > = {};
  allFeatures.value.forEach((feature) => {
    const categoryName = feature.category?.name || "Uncategorized";
    if (!grouped[categoryName]) {
      grouped[categoryName] = {
        category: feature.category || null,
        features: [],
      };
    }
    grouped[categoryName].features.push(feature);
  });
  return grouped;
});

const getCategoryColor = (
  category: FeatureCategory | null,
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

const toggleFeature = (featureId: string) => {
  featureStates.value[featureId] = !featureStates.value[featureId];
};

const saveFeatures = async () => {
  try {
    isSaving.value = true;

    // Convert featureStates to API format
    const features = Object.entries(featureStates.value).map(
      ([featureId, enabled]) => ({
        featureId,
        enabled,
      }),
    );

    await $fetch(`/api/platform/plans/${planId}/features`, {
      method: "POST",
      body: { features },
    });

    toast.add({
      title: "Success",
      description: "Plan features updated successfully",
      color: "success",
    });

    await refreshPlanFeatures();
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to update plan features";
    toast.add({
      title: "Error",
      description: errorMessage,
      color: "error",
    });
  } finally {
    isSaving.value = false;
  }
};

const enabledCount = computed(() => {
  return Object.values(featureStates.value).filter((v) => v).length;
});

const totalCount = computed(() => {
  return allFeatures.value?.length || 0;
});
</script>

<template>
  <div>
    <div class="mb-8">
      <div class="flex items-center gap-4 mb-2">
        <UButton
          variant="ghost"
          icon="i-lucide-arrow-left"
          to="/platform/plans"
        >
          Back to Plans
        </UButton>
      </div>
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">
            {{ plan?.name }} - Features
          </h1>
          <p class="mt-2 text-gray-600">
            Configure which features are available in this plan
          </p>
          <p class="mt-1 text-sm text-gray-500">
            {{ enabledCount }} of {{ totalCount }} features enabled
          </p>
        </div>
        <div class="flex items-center gap-3">
          <UButton variant="ghost" to="/platform/plans"> Cancel </UButton>
          <UButton
            color="primary"
            :loading="isSaving"
            :disabled="isSaving"
            @click="saveFeatures"
          >
            <template #leading>
              <UIcon name="i-lucide-save" />
            </template>
            Save Changes
          </UButton>
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
            <p class="text-2xl font-bold">{{ totalCount }}</p>
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
            <p class="text-sm text-gray-600">Enabled</p>
            <p class="text-2xl font-bold">{{ enabledCount }}</p>
          </div>
        </div>
      </UCard>

      <UCard>
        <div class="flex items-center gap-4">
          <div class="rounded-lg bg-neutral-100 p-3">
            <UIcon name="i-lucide-x-circle" class="w-6 h-6 text-neutral-700" />
          </div>
          <div>
            <p class="text-sm text-gray-600">Disabled</p>
            <p class="text-2xl font-bold">{{ totalCount - enabledCount }}</p>
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
                {{
                  categoryData.features.filter((f) => featureStates[f.id])
                    .length
                }}
                / {{ categoryData.features.length }} enabled
              </span>
            </div>
          </template>

          <div class="space-y-2">
            <div
              v-for="feature in categoryData.features"
              :key="feature.id"
              class="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
              @click="toggleFeature(feature.id)"
            >
              <div class="flex items-center gap-4 flex-1">
                <UCheckbox
                  :model-value="featureStates[feature.id]"
                  @update:model-value="toggleFeature(feature.id)"
                />
                <div>
                  <h3 class="font-semibold text-gray-900">
                    {{ feature.name }}
                  </h3>
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
                </div>
              </div>

              <UBadge
                :color="featureStates[feature.id] ? 'success' : 'neutral'"
                variant="subtle"
              >
                {{ featureStates[feature.id] ? "Enabled" : "Disabled" }}
              </UBadge>
            </div>
          </div>
        </UCard>
      </div>
    </div>
  </div>
</template>
