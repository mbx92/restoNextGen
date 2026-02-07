<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between">
        <div>
          <h3 class="text-lg font-semibold text-gray-900">Plan Usage</h3>
          <p class="text-sm text-gray-600">Monitor your resource usage</p>
        </div>
        <UButton
          v-if="showUpgradeButton"
          color="primary"
          size="sm"
          @click="navigateTo('/admin/settings#subscription')"
        >
          Upgrade Plan
        </UButton>
      </div>
    </template>

    <div v-if="usage" class="space-y-6">
      <!-- Menu Items -->
      <div>
        <div class="mb-2 flex items-center justify-between">
          <span class="text-sm font-medium text-gray-700">Menu Items</span>
          <span class="text-sm text-gray-600">
            {{ usage.menuItems.current }} /
            {{ formatLimit(usage.menuItems.limit) }}
          </span>
        </div>
        <UProgress
          :value="getUsagePercentage(usage.menuItems)"
          :color="getProgressColor(usage.menuItems)"
          size="sm"
        />
        <p
          v-if="isNearLimit(usage.menuItems)"
          class="mt-1 text-xs text-orange-600"
        >
          ⚠️ You're approaching your limit
        </p>
      </div>

      <!-- Tables -->
      <div>
        <div class="mb-2 flex items-center justify-between">
          <span class="text-sm font-medium text-gray-700">Tables</span>
          <span class="text-sm text-gray-600">
            {{ usage.tables.current }} / {{ formatLimit(usage.tables.limit) }}
          </span>
        </div>
        <UProgress
          :value="getUsagePercentage(usage.tables)"
          :color="getProgressColor(usage.tables)"
          size="sm"
        />
        <p
          v-if="isNearLimit(usage.tables)"
          class="mt-1 text-xs text-orange-600"
        >
          ⚠️ You're approaching your limit
        </p>
      </div>

      <!-- Orders (This Month) -->
      <div>
        <div class="mb-2 flex items-center justify-between">
          <span class="text-sm font-medium text-gray-700">
            Orders (This Month)
          </span>
          <span class="text-sm text-gray-600">
            {{ usage.orders.current }} / {{ formatLimit(usage.orders.limit) }}
          </span>
        </div>
        <UProgress
          :value="getUsagePercentage(usage.orders)"
          :color="getProgressColor(usage.orders)"
          size="sm"
        />
        <p
          v-if="isNearLimit(usage.orders)"
          class="mt-1 text-xs text-orange-600"
        >
          ⚠️ You're approaching your monthly limit
        </p>
      </div>

      <!-- Users -->
      <div>
        <div class="mb-2 flex items-center justify-between">
          <span class="text-sm font-medium text-gray-700">Users / Staff</span>
          <span class="text-sm text-gray-600">
            {{ usage.users.current }} / {{ formatLimit(usage.users.limit) }}
          </span>
        </div>
        <UProgress
          :value="getUsagePercentage(usage.users)"
          :color="getProgressColor(usage.users)"
          size="sm"
        />
        <p v-if="isNearLimit(usage.users)" class="mt-1 text-xs text-orange-600">
          ⚠️ You're approaching your limit
        </p>
      </div>

      <!-- Locations -->
      <div>
        <div class="mb-2 flex items-center justify-between">
          <span class="text-sm font-medium text-gray-700">Locations</span>
          <span class="text-sm text-gray-600">
            {{ usage.locations.current }} /
            {{ formatLimit(usage.locations.limit) }}
          </span>
        </div>
        <UProgress
          :value="getUsagePercentage(usage.locations)"
          :color="getProgressColor(usage.locations)"
          size="sm"
        />
      </div>
    </div>

    <!-- Loading State -->
    <div v-else class="flex justify-center py-8">
      <UIcon
        name="i-heroicons-arrow-path"
        class="h-6 w-6 animate-spin text-gray-400"
      />
    </div>

    <template #footer>
      <div class="text-xs text-gray-500">
        <p>
          Need more resources?
          <a
            href="/admin/settings#subscription"
            class="text-primary-600 hover:underline"
          >
            View available plans
          </a>
        </p>
      </div>
    </template>
  </UCard>
</template>

<script setup lang="ts">
const {
  usage,
  isNearLimit,
  getUsagePercentage,
  getProgressColor,
  formatLimit,
} = usePlanLimits();

// Show upgrade button if any resource is at or near limit
const showUpgradeButton = computed(() => {
  if (!usage.value) return false;

  return Object.values(usage.value).some((resource) => isNearLimit(resource));
});
</script>
