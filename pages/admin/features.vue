<script setup lang="ts">
definePageMeta({
  layout: "admin",
  middleware: ["admin-auth"],
});

const { features, hasFeature, requireFeature } = useFeatures();

// Demo actions
const testCustomDomain = () => {
  if (!requireFeature("CUSTOM_DOMAIN", "Custom Domain")) return;
  alert("Custom Domain feature is enabled! You can configure your domain.");
};

const testAdvancedAnalytics = () => {
  if (!requireFeature("ADVANCED_ANALYTICS", "Advanced Analytics")) return;
  alert("Advanced Analytics feature is enabled! Opening analytics...");
};

const testApiAccess = () => {
  if (!requireFeature("API_ACCESS", "API Access")) return;
  alert("API Access is enabled! You can generate API keys.");
};

const testWhiteLabel = () => {
  if (!requireFeature("WHITE_LABEL", "White Label Branding")) return;
  alert("White Label is enabled! You can remove platform branding.");
};

// Feature categories for organized display
const featuresByCategory = computed(() => {
  if (!features.value) return {};

  const categories: Record<
    string,
    { code: string; name: string; enabled: boolean }[]
  > = {
    branding: [],
    analytics: [],
    integrations: [],
    support: [],
    advanced: [],
  };

  const featureMetadata: Record<string, { name: string; category: string }> = {
    CUSTOM_DOMAIN: { name: "Custom Domain", category: "branding" },
    CUSTOM_BRANDING: { name: "Custom Branding", category: "branding" },
    WHITE_LABEL: { name: "White Label", category: "branding" },
    BASIC_REPORTING: { name: "Basic Reporting", category: "analytics" },
    ADVANCED_ANALYTICS: { name: "Advanced Analytics", category: "analytics" },
    REAL_TIME_DASHBOARD: { name: "Real-time Dashboard", category: "analytics" },
    API_ACCESS: { name: "API Access", category: "integrations" },
    WEBHOOKS: { name: "Webhooks", category: "integrations" },
    THIRD_PARTY_INTEGRATIONS: {
      name: "Third-party Integrations",
      category: "integrations",
    },
    EMAIL_SUPPORT: { name: "Email Support", category: "support" },
    PRIORITY_SUPPORT: { name: "Priority Support", category: "support" },
    DEDICATED_ACCOUNT_MANAGER: {
      name: "Dedicated Account Manager",
      category: "support",
    },
    MULTI_LOCATION: { name: "Multi-location", category: "advanced" },
    INVENTORY_MANAGEMENT: {
      name: "Inventory Management",
      category: "advanced",
    },
    STAFF_MANAGEMENT: { name: "Staff Management", category: "advanced" },
    CUSTOM_WORKFLOWS: { name: "Custom Workflows", category: "advanced" },
  };

  Object.entries(features.value).forEach(([code, enabled]) => {
    const meta = featureMetadata[code];
    if (!meta) return;

    const category = categories[meta.category];
    if (!category) return;

    category.push({
      code,
      name: meta.name,
      enabled: enabled as boolean,
    });
  });

  return categories;
});

const categoryInfo = {
  branding: {
    title: "Branding",
    icon: "i-lucide-palette",
    color: "purple",
  },
  analytics: {
    title: "Analytics",
    icon: "i-lucide-bar-chart-3",
    color: "primary",
  },
  integrations: {
    title: "Integrations",
    icon: "i-lucide-plug",
    color: "info",
  },
  support: {
    title: "Support",
    icon: "i-lucide-headphones",
    color: "success",
  },
  advanced: {
    title: "Advanced",
    icon: "i-lucide-settings-2",
    color: "warning",
  },
};
</script>

<template>
  <div>
    <div class="mb-8">
      <h1 class="text-3xl font-serif font-bold text-stone-900">
        Feature Gating Demo
      </h1>
      <p class="mt-2 text-stone-600">
        Test and explore your plan's available features
      </p>
    </div>

    <!-- Quick Actions -->
    <div class="mb-8">
      <UCard>
        <template #header>
          <h2 class="text-xl font-semibold">Interactive Feature Tests</h2>
          <p class="text-sm text-gray-500 mt-1">
            Click buttons to test feature gating in action
          </p>
        </template>

        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <UButton
            block
            :color="hasFeature('CUSTOM_DOMAIN') ? 'primary' : 'neutral'"
            :disabled="!hasFeature('CUSTOM_DOMAIN')"
            @click="testCustomDomain"
          >
            <template #leading>
              <UIcon
                :name="
                  hasFeature('CUSTOM_DOMAIN')
                    ? 'i-lucide-globe'
                    : 'i-lucide-lock'
                "
              />
            </template>
            Custom Domain
          </UButton>

          <UButton
            block
            :color="hasFeature('ADVANCED_ANALYTICS') ? 'primary' : 'neutral'"
            :disabled="!hasFeature('ADVANCED_ANALYTICS')"
            @click="testAdvancedAnalytics"
          >
            <template #leading>
              <UIcon
                :name="
                  hasFeature('ADVANCED_ANALYTICS')
                    ? 'i-lucide-line-chart'
                    : 'i-lucide-lock'
                "
              />
            </template>
            Analytics
          </UButton>

          <UButton
            block
            :color="hasFeature('API_ACCESS') ? 'primary' : 'neutral'"
            :disabled="!hasFeature('API_ACCESS')"
            @click="testApiAccess"
          >
            <template #leading>
              <UIcon
                :name="
                  hasFeature('API_ACCESS') ? 'i-lucide-code' : 'i-lucide-lock'
                "
              />
            </template>
            API Access
          </UButton>

          <UButton
            block
            :color="hasFeature('WHITE_LABEL') ? 'primary' : 'neutral'"
            :disabled="!hasFeature('WHITE_LABEL')"
            @click="testWhiteLabel"
          >
            <template #leading>
              <UIcon
                :name="
                  hasFeature('WHITE_LABEL') ? 'i-lucide-brush' : 'i-lucide-lock'
                "
              />
            </template>
            White Label
          </UButton>
        </div>
      </UCard>
    </div>

    <!-- Features by Category -->
    <div class="grid gap-6 lg:grid-cols-2">
      <div
        v-for="(category, key) in featuresByCategory"
        :key="key"
        class="w-full"
      >
        <UCard v-if="category.length > 0">
          <template #header>
            <div class="flex items-center gap-3">
              <div
                :class="[
                  'rounded-lg p-2',
                  `bg-${categoryInfo[key as keyof typeof categoryInfo].color}-100`,
                ]"
              >
                <UIcon
                  :name="categoryInfo[key as keyof typeof categoryInfo].icon"
                  :class="`text-${categoryInfo[key as keyof typeof categoryInfo].color}-700`"
                  class="w-5 h-5"
                />
              </div>
              <div>
                <h3 class="text-lg font-semibold">
                  {{ categoryInfo[key as keyof typeof categoryInfo].title }}
                </h3>
                <p class="text-sm text-gray-500">
                  {{ category.filter((f) => f.enabled).length }} of
                  {{ category.length }} enabled
                </p>
              </div>
            </div>
          </template>

          <div class="space-y-2">
            <div
              v-for="feature in category"
              :key="feature.code"
              class="flex items-center justify-between rounded-lg border p-3"
              :class="
                feature.enabled
                  ? 'border-green-200 bg-green-50'
                  : 'border-gray-200 bg-gray-50'
              "
            >
              <div class="flex items-center gap-3">
                <UIcon
                  :name="
                    feature.enabled
                      ? 'i-lucide-check-circle-2'
                      : 'i-lucide-lock'
                  "
                  :class="feature.enabled ? 'text-green-600' : 'text-gray-400'"
                  class="w-5 h-5"
                />
                <span
                  :class="feature.enabled ? 'text-gray-900' : 'text-gray-500'"
                  class="font-medium"
                >
                  {{ feature.name }}
                </span>
              </div>
              <UBadge
                :color="feature.enabled ? 'success' : 'neutral'"
                variant="subtle"
              >
                {{ feature.enabled ? "Active" : "Locked" }}
              </UBadge>
            </div>
          </div>
        </UCard>
      </div>
    </div>

    <!-- Upgrade CTA (shown if any features are disabled) -->
    <div
      v-if="
        Object.values(featuresByCategory).some((cat) =>
          cat.some((f) => !f.enabled),
        )
      "
      class="mt-8"
    >
      <UCard>
        <div class="text-center py-6">
          <UIcon
            name="i-lucide-sparkles"
            class="w-12 h-12 mx-auto mb-4 text-primary-500"
          />
          <h3 class="text-xl font-semibold mb-2">Unlock More Features</h3>
          <p class="text-gray-600 mb-4">
            Upgrade your plan to access advanced features and grow your business
          </p>
          <UButton color="primary" size="lg" to="/admin/settings#subscription">
            View Plans & Upgrade
          </UButton>
        </div>
      </UCard>
    </div>

    <!-- Code Examples -->
    <div class="mt-8">
      <UCard>
        <template #header>
          <h2 class="text-xl font-semibold">Implementation Examples</h2>
          <p class="text-sm text-gray-500 mt-1">
            How to use feature gating in your code
          </p>
        </template>

        <div class="space-y-4">
          <div>
            <h4 class="font-medium mb-2">Backend (Server-side)</h4>
            <pre
              class="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm"
            ><code>// In server/api endpoint
import { hasFeature } from '~/server/utils/feature-gating';

export default defineEventHandler(async (event) => {
  if (!await hasFeature(event, 'CUSTOM_DOMAIN')) {
    throw createError({ statusCode: 403, message: 'Upgrade required' });
  }
  
  // Feature-gated logic here
});</code></pre>
          </div>

          <div>
            <h4 class="font-medium mb-2">Frontend (Component)</h4>
            <pre
              class="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm"
            ><code>&lt;script setup&gt;
const { hasFeature, requireFeature } = useFeatures();

const openAnalytics = () => {
  if (!requireFeature('ADVANCED_ANALYTICS', 'Advanced Analytics')) return;
  // Show analytics
};
&lt;/script&gt;

&lt;template&gt;
  &lt;UButton v-if="hasFeature('ADVANCED_ANALYTICS')" @click="openAnalytics"&gt;
    Analytics Dashboard
  &lt;/UButton&gt;
&lt;/template&gt;</code></pre>
          </div>
        </div>
      </UCard>
    </div>
  </div>
</template>
