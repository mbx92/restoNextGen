<template>
  <div>
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Platform Dashboard</h1>
      <p class="text-gray-600">Overview of all tenants and subscriptions</p>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 gap-6 mb-6 md:grid-cols-4">
      <UCard>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600">Total Tenants</p>
            <p class="text-2xl font-bold text-gray-900">
              {{ safeStats.totalTenants }}
            </p>
          </div>
          <div class="p-3 rounded-full bg-primary-100">
            <UIcon
              name="i-heroicons-building-storefront"
              class="w-6 h-6 text-primary-600"
            />
          </div>
        </div>
      </UCard>

      <UCard>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600">Active Subscriptions</p>
            <p class="text-2xl font-bold text-gray-900">
              {{ safeStats.activeSubscriptions }}
            </p>
          </div>
          <div class="p-3 rounded-full bg-green-100">
            <UIcon
              name="i-heroicons-check-circle"
              class="w-6 h-6 text-green-600"
            />
          </div>
        </div>
      </UCard>

      <UCard>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600">Trial Subscriptions</p>
            <p class="text-2xl font-bold text-gray-900">
              {{ safeStats.trialSubscriptions }}
            </p>
          </div>
          <div class="p-3 rounded-full bg-yellow-100">
            <UIcon name="i-heroicons-clock" class="w-6 h-6 text-yellow-600" />
          </div>
        </div>
      </UCard>

      <UCard>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600">Monthly Revenue</p>
            <p class="text-2xl font-bold text-gray-900">$0</p>
          </div>
          <div class="p-3 rounded-full bg-blue-100">
            <UIcon
              name="i-heroicons-currency-dollar"
              class="w-6 h-6 text-blue-600"
            />
          </div>
        </div>
      </UCard>
    </div>

    <!-- Recent Tenants -->
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-semibold">Recent Tenants</h2>
          <UButton
            to="/platform/tenants"
            variant="ghost"
            trailing-icon="i-heroicons-arrow-right"
          >
            View All
          </UButton>
        </div>
      </template>

      <ClientOnly>
        <UTable :data="safeTenants" :columns="columns">
          <template #name-cell="{ row }">
            <div>
              <p class="font-medium text-gray-900">{{ row.original.name }}</p>
              <p class="text-sm text-gray-500">
                {{ row.original.slug }}.yourapp.com
              </p>
            </div>
          </template>

          <template #businessType-cell="{ row }">
            <UBadge color="primary" variant="subtle">{{
              row.original.businessType
            }}</UBadge>
          </template>

          <template #plan-cell="{ row }">
            <UBadge
              :color="
                row.original.plan === 'pro'
                  ? 'success'
                  : row.original.plan === 'starter'
                    ? 'primary'
                    : 'neutral'
              "
              variant="subtle"
            >
              {{ row.original.plan.toUpperCase() }}
            </UBadge>
          </template>

          <template #isActive-cell="{ row }">
            <UBadge
              :color="row.original.isActive ? 'success' : 'error'"
              variant="subtle"
            >
              {{ row.original.isActive ? "Active" : "Inactive" }}
            </UBadge>
          </template>

          <template #createdAt-cell="{ row }">
            {{ formatDate(row.original.createdAt) }}
          </template>
        </UTable>

        <template #fallback>
          <div class="p-4 text-center text-gray-500">Loading...</div>
        </template>
      </ClientOnly>
    </UCard>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: "platform",
  middleware: ["platform-auth"],
});

// Fetch stats
const { data: stats } = await useFetch("/api/platform/stats");

// Fetch recent tenants
const { data: recentTenants } = await useFetch("/api/platform/tenants", {
  query: { limit: 5 },
});

// Default values to prevent errors
const safeStats = computed(
  () =>
    stats.value || {
      totalTenants: 0,
      activeSubscriptions: 0,
      trialSubscriptions: 0,
    },
);
const safeTenants = computed(() => recentTenants.value || []);

const columns = [
  { accessorKey: "name", header: "Tenant" },
  { accessorKey: "businessType", header: "Type" },
  { accessorKey: "plan", header: "Plan" },
  { accessorKey: "isActive", header: "Status" },
  { accessorKey: "createdAt", header: "Created" },
];

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};
</script>
