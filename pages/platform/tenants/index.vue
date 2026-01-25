<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Tenants</h1>
        <p class="text-gray-600">Manage all tenant accounts</p>
      </div>

      <!-- Create Tenant Modal with Trigger -->
      <UModal v-model:open="isCreateModalOpen" title="Create New Tenant">
        <UButton icon="i-heroicons-plus" size="lg"> Create Tenant </UButton>

        <template #body>
          <p class="text-gray-600">Coming soon...</p>
        </template>

        <template #footer="{ close }">
          <UButton
            label="Cancel"
            color="neutral"
            variant="outline"
            @click="close"
          />
        </template>
      </UModal>
    </div>

    <!-- Filters -->
    <UCard class="mb-6">
      <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
        <UInput
          v-model="filters.search"
          icon="i-heroicons-magnifying-glass"
          placeholder="Search tenants..."
          class="w-full"
        />
        <USelectMenu
          v-model="filters.businessType"
          :options="businessTypes"
          class="w-full"
        />
        <USelectMenu
          v-model="filters.status"
          :options="statusOptions"
          class="w-full"
        />
      </div>
    </UCard>

    <!-- Tenants Table -->
    <UCard>
      <ClientOnly>
        <UTable :data="filteredTenants" :columns="columns" :loading="pending">
          <template #name-cell="{ row }">
            <div>
              <p class="font-medium text-gray-900">{{ row.original.name }}</p>
              <p class="text-sm text-gray-500">
                {{ row.original.slug }}.yourapp.com
              </p>
              <p class="text-xs text-gray-400 mt-0.5">
                {{ row.original.ownerEmail }}
              </p>
            </div>
          </template>

          <template #businessType-cell="{ row }">
            <UBadge color="primary" variant="subtle">{{
              row.original.businessType
            }}</UBadge>
          </template>

          <template #subscription-cell="{ row }">
            <div v-if="row.original.subscription">
              <UBadge
                :color="getSubscriptionColor(row.original.subscription.status)"
                variant="subtle"
                class="mb-1"
              >
                {{ row.original.subscription.status }}
              </UBadge>
              <p class="text-xs text-gray-500">
                {{ row.original.subscription.plan.toUpperCase() }}
              </p>
            </div>
            <span v-else class="text-sm text-gray-400">No subscription</span>
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
type Tenant = {
  id: string;
  name: string;
  slug: string;
  status: string;
  email: string;
  ownerEmail?: string;
  businessType?: string;
  isActive: boolean;
  createdAt: string;
  subscription?: {
    plan: string;
    status: string;
  };
};

definePageMeta({
  layout: "platform",
  middleware: ["platform-auth"],
});

const {
  data: tenants,
  pending,
  error: _error,
} = await useFetch<Tenant[]>("/api/platform/tenants");

const isCreateModalOpen = ref(false);

const filters = ref({
  search: "",
  businessType: null,
  status: null,
});

const businessTypes = [
  { value: null, label: "All Business Types" },
  { value: "restaurant", label: "Restaurant" },
  { value: "retail", label: "Retail" },
  { value: "salon", label: "Salon" },
];

const statusOptions = [
  { value: null, label: "All Status" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

const columns = [
  { accessorKey: "name", header: "Tenant" },
  { accessorKey: "businessType", header: "Type" },
  { accessorKey: "subscription", header: "Subscription" },
  { accessorKey: "isActive", header: "Status" },
  { accessorKey: "createdAt", header: "Created" },
  { id: "actions", header: "" },
];

const filteredTenants = computed(() => {
  if (!tenants.value) return [];

  const filtered = tenants.value.filter((tenant: Tenant) => {
    if (
      filters.value.search &&
      !tenant.name.toLowerCase().includes(filters.value.search.toLowerCase()) &&
      !tenant.slug.toLowerCase().includes(filters.value.search.toLowerCase())
    ) {
      return false;
    }

    if (
      filters.value.businessType !== null &&
      tenant.businessType !== filters.value.businessType
    ) {
      return false;
    }

    if (filters.value.status !== null) {
      const isActive = filters.value.status === "active";
      if (tenant.isActive !== isActive) {
        return false;
      }
    }

    return true;
  });

  return filtered;
});

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const getSubscriptionColor = (status: string) => {
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

const getActions = (tenant: Tenant) => [
  [
    {
      label: "View Details",
      icon: "i-heroicons-eye",
      click: () => navigateTo(`/platform/tenants/${tenant.id}`),
    },
    {
      label: "Edit",
      icon: "i-heroicons-pencil",
      click: () => console.log("Edit", tenant.id),
    },
  ],
  [
    {
      label: tenant.isActive ? "Deactivate" : "Activate",
      icon: tenant.isActive
        ? "i-heroicons-no-symbol"
        : "i-heroicons-check-circle",
      click: () => console.log("Toggle active", tenant.id),
    },
  ],
];
</script>
