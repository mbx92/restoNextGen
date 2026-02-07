<script setup lang="ts">
const { getEnabledFeatures, getDisabledFeatures } = useFeatures();

const featureNames: Record<string, string> = {
  CUSTOM_DOMAIN: "Custom Domain",
  CUSTOM_BRANDING: "Custom Branding",
  WHITE_LABEL: "White Label",
  BASIC_REPORTING: "Basic Reporting",
  ADVANCED_ANALYTICS: "Advanced Analytics",
  REAL_TIME_DASHBOARD: "Real-time Dashboard",
  API_ACCESS: "API Access",
  WEBHOOKS: "Webhooks",
  THIRD_PARTY_INTEGRATIONS: "Third-party Integrations",
  EMAIL_SUPPORT: "Email Support",
  PRIORITY_SUPPORT: "Priority Support",
  DEDICATED_ACCOUNT_MANAGER: "Dedicated Account Manager",
  MULTI_LOCATION: "Multi-location",
  INVENTORY_MANAGEMENT: "Inventory Management",
  STAFF_MANAGEMENT: "Staff Management",
  CUSTOM_WORKFLOWS: "Custom Workflows",
};

const enabledFeatures = computed(() => getEnabledFeatures());
const disabledFeatures = computed(() => getDisabledFeatures());

const showUpgrade = () => {
  navigateTo("/admin/settings#subscription");
};
</script>

<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between">
        <div>
          <h3 class="text-lg font-semibold">Plan Features</h3>
          <p class="text-sm text-gray-500">
            {{ enabledFeatures.length }} features enabled
          </p>
        </div>
        <UButton
          v-if="disabledFeatures.length > 0"
          color="primary"
          size="sm"
          @click="showUpgrade"
        >
          Upgrade Plan
        </UButton>
      </div>
    </template>

    <div class="space-y-4">
      <!-- Enabled Features -->
      <div v-if="enabledFeatures.length > 0">
        <h4 class="text-sm font-medium text-gray-700 mb-2">Active Features</h4>
        <div class="flex flex-wrap gap-2">
          <UBadge
            v-for="featureCode in enabledFeatures"
            :key="featureCode"
            color="success"
            variant="subtle"
            size="md"
          >
            <template #leading>
              <UIcon name="i-lucide-check-circle" />
            </template>
            {{ featureNames[featureCode] || featureCode }}
          </UBadge>
        </div>
      </div>

      <!-- Disabled Features -->
      <div v-if="disabledFeatures.length > 0">
        <h4 class="text-sm font-medium text-gray-400 mb-2">
          Upgrade to Unlock
        </h4>
        <div class="flex flex-wrap gap-2">
          <UBadge
            v-for="featureCode in disabledFeatures"
            :key="featureCode"
            color="neutral"
            variant="subtle"
            size="md"
          >
            <template #leading>
              <UIcon name="i-lucide-lock" />
            </template>
            {{ featureNames[featureCode] || featureCode }}
          </UBadge>
        </div>
      </div>

      <!-- No features -->
      <div
        v-if="enabledFeatures.length === 0 && disabledFeatures.length === 0"
        class="text-center text-gray-500 py-8"
      >
        <UIcon name="i-lucide-info" class="w-8 h-8 mx-auto mb-2" />
        <p>Loading features...</p>
      </div>
    </div>
  </UCard>
</template>
