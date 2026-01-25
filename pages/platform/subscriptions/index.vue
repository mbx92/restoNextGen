<template>
  <div>
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Subscriptions</h1>
      <p class="text-gray-600">Manage tenant subscriptions and billing</p>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-1 gap-4 mb-6 md:grid-cols-5">
      <UCard v-for="stat in subscriptionStats" :key="stat.status">
        <div class="text-center">
          <p class="text-sm text-gray-600">{{ stat.label }}</p>
          <p class="text-2xl font-bold text-gray-900">{{ stat.count }}</p>
        </div>
      </UCard>
    </div>

    <!-- Subscriptions Table -->
    <UCard>
      <ClientOnly>
        <UTable
          :data="subscriptions || []"
          :columns="columns"
          :loading="pending"
        >
          <template #tenant-cell="{ row }">
            <div>
              <p class="font-medium text-gray-900">
                {{ row.original.tenant.name }}
              </p>
              <p class="text-sm text-gray-500">
                {{ row.original.tenant.slug }}
              </p>
            </div>
          </template>

          <template #plan-cell="{ row }">
            <UBadge
              :color="getPlanColor(row.original.plan)"
              variant="subtle"
              size="lg"
            >
              {{ row.original.plan.toUpperCase() }}
            </UBadge>
          </template>

          <template #status-cell="{ row }">
            <UBadge
              :color="getStatusColor(row.original.status)"
              variant="subtle"
            >
              {{ row.original.status }}
            </UBadge>
          </template>

          <template #period-cell="{ row }">
            <div
              v-if="
                row.original.currentPeriodStart && row.original.currentPeriodEnd
              "
            >
              <p class="text-sm text-gray-900">
                {{ formatDate(row.original.currentPeriodStart) }} -
                {{ formatDate(row.original.currentPeriodEnd) }}
              </p>
              <p v-if="row.original.trialEndsAt" class="text-xs text-gray-500">
                Trial ends: {{ formatDate(row.original.trialEndsAt) }}
              </p>
            </div>
            <span v-else class="text-sm text-gray-400">-</span>
          </template>

          <template #actions-cell="{ row }">
            <UDropdownMenu :items="getActions(row.original)">
              <UButton
                icon="i-heroicons-ellipsis-vertical"
                variant="ghost"
                color="neutral"
              />
            </UDropdownMenu>
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
type Subscription = {
  id: string;
  plan: string;
  status: string;
  tenantId: string;
  tenant: {
    name: string;
    slug: string;
  };
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  trialEndsAt: string | null;
};

definePageMeta({
  layout: "platform",
  middleware: ["platform-auth"],
});

const { data: subscriptions, pending } = await useFetch<Subscription[]>(
  "/api/platform/subscriptions",
);

const subscriptionStats = computed(() => {
  if (!subscriptions.value) return [];

  const stats = subscriptions.value.reduce(
    (acc, sub) => {
      acc[sub.status] = (acc[sub.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  return [
    { status: "TRIAL", label: "Trial", count: stats.TRIAL || 0 },
    { status: "ACTIVE", label: "Active", count: stats.ACTIVE || 0 },
    { status: "PAST_DUE", label: "Past Due", count: stats.PAST_DUE || 0 },
    { status: "CANCELLED", label: "Cancelled", count: stats.CANCELLED || 0 },
    { status: "EXPIRED", label: "Expired", count: stats.EXPIRED || 0 },
  ];
});

const columns = [
  { accessorKey: "tenant", header: "Tenant" },
  { accessorKey: "plan", header: "Plan" },
  { accessorKey: "status", header: "Status" },
  { accessorKey: "period", header: "Period" },
  { id: "actions", header: "" },
];

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const getPlanColor = (plan: string) => {
  switch (plan) {
    case "enterprise":
      return "primary";
    case "pro":
      return "success";
    case "starter":
      return "secondary";
    default:
      return "neutral";
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "ACTIVE":
      return "success";
    case "TRIAL":
      return "warning";
    case "PAST_DUE":
      return "warning";
    case "CANCELLED":
    case "EXPIRED":
      return "error";
    default:
      return "neutral";
  }
};

const getActions = (subscription: Subscription) => [
  [
    {
      label: "Upgrade Plan",
      icon: "i-heroicons-arrow-trending-up",
      click: () => console.log("Upgrade", subscription.id),
    },
    {
      label: "Extend Trial",
      icon: "i-heroicons-clock",
      click: () => console.log("Extend trial", subscription.id),
    },
  ],
  [
    {
      label: "Cancel Subscription",
      icon: "i-heroicons-x-circle",
      click: () => console.log("Cancel", subscription.id),
    },
  ],
];
</script>
