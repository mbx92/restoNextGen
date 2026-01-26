<script setup lang="ts">
definePageMeta({
  layout: "admin",
  middleware: ["admin-auth"],
});

const toast = useToast();

interface Campaign {
  id: string;
  name: string;
  type: "discount" | "points" | "bundle" | "flash_sale";
  status: "draft" | "scheduled" | "active" | "ended";
  startDate: string;
  endDate: string;
  discount?: number;
  targetAudience: string;
  reach: number;
  conversions: number;
}

// Mock data
const campaigns = ref<Campaign[]>([
  {
    id: "1",
    name: "New Year Sale 2026",
    type: "discount",
    status: "active",
    startDate: "2026-01-01T00:00:00Z",
    endDate: "2026-01-31T23:59:59Z",
    discount: 20,
    targetAudience: "All Customers",
    reach: 500,
    conversions: 45,
  },
  {
    id: "2",
    name: "Double Points Weekend",
    type: "points",
    status: "scheduled",
    startDate: "2026-02-01T00:00:00Z",
    endDate: "2026-02-02T23:59:59Z",
    targetAudience: "Loyalty Members",
    reach: 0,
    conversions: 0,
  },
  {
    id: "3",
    name: "Bundle Promo Electronics",
    type: "bundle",
    status: "active",
    startDate: "2026-01-15T00:00:00Z",
    endDate: "2026-02-15T23:59:59Z",
    discount: 15,
    targetAudience: "All Customers",
    reach: 200,
    conversions: 25,
  },
  {
    id: "4",
    name: "Flash Sale December",
    type: "flash_sale",
    status: "ended",
    startDate: "2025-12-25T00:00:00Z",
    endDate: "2025-12-26T23:59:59Z",
    discount: 50,
    targetAudience: "Newsletter Subscribers",
    reach: 350,
    conversions: 80,
  },
]);

const searchQuery = ref("");
const statusFilter = ref("ALL");

const statusOptions = [
  { label: "All Status", value: "ALL" },
  { label: "Draft", value: "draft" },
  { label: "Scheduled", value: "scheduled" },
  { label: "Active", value: "active" },
  { label: "Ended", value: "ended" },
];

const filteredCampaigns = computed(() => {
  return campaigns.value.filter((c) => {
    const matchesSearch = c.name
      .toLowerCase()
      .includes(searchQuery.value.toLowerCase());
    const matchesStatus =
      statusFilter.value === "ALL" || c.status === statusFilter.value;
    return matchesSearch && matchesStatus;
  });
});

const stats = computed(() => ({
  total: campaigns.value.length,
  active: campaigns.value.filter((c) => c.status === "active").length,
  totalReach: campaigns.value.reduce((sum, c) => sum + c.reach, 0),
  totalConversions: campaigns.value.reduce((sum, c) => sum + c.conversions, 0),
}));

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const getStatusColor = (
  status: string
): "neutral" | "primary" | "success" | "error" | "warning" => {
  const colors: Record<
    string,
    "neutral" | "primary" | "success" | "error" | "warning"
  > = {
    draft: "neutral",
    scheduled: "primary",
    active: "success",
    ended: "error",
  };
  return colors[status] || "neutral";
};

const getTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    discount: "Discount",
    points: "Points Multiplier",
    bundle: "Bundle Deal",
    flash_sale: "Flash Sale",
  };
  return labels[type] || type;
};

const getTypeIcon = (type: string) => {
  const icons: Record<string, string> = {
    discount: "i-heroicons-receipt-percent",
    points: "i-heroicons-star",
    bundle: "i-heroicons-cube",
    flash_sale: "i-heroicons-bolt",
  };
  return icons[type] || "i-heroicons-tag";
};

const showCreateModal = ref(false);
const campaignForm = ref({
  name: "",
  type: "discount" as Campaign["type"],
  startDate: "",
  endDate: "",
  discount: 10,
  targetAudience: "All Customers",
});

const typeOptions = [
  { label: "Discount", value: "discount" },
  { label: "Points Multiplier", value: "points" },
  { label: "Bundle Deal", value: "bundle" },
  { label: "Flash Sale", value: "flash_sale" },
];

const createCampaign = () => {
  toast.add({
    title: "Coming Soon",
    description: "Campaign creation will be available soon",
    color: "primary",
  });
  showCreateModal.value = false;
};

const columns = [
  { accessorKey: "campaign", header: "Campaign" },
  { accessorKey: "type", header: "Type" },
  { accessorKey: "status", header: "Status" },
  { accessorKey: "period", header: "Period" },
  { accessorKey: "reach", header: "Reach" },
  { accessorKey: "conversions", header: "Conversions" },
  { accessorKey: "actions", header: "" },
];
</script>

<template>
  <div>
    <div class="mb-8 flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-serif font-bold text-stone-900">Campaigns</h1>
        <p class="mt-2 text-stone-600">
          Create and manage marketing campaigns
        </p>
      </div>
      <UButton
        color="primary"
        icon="i-heroicons-plus"
        @click="showCreateModal = true"
      >
        Create Campaign
      </UButton>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-4 gap-4 mb-6">
      <UCard>
        <div class="text-center">
          <p class="text-2xl font-bold text-stone-900">{{ stats.total }}</p>
          <p class="text-sm text-stone-500">Total Campaigns</p>
        </div>
      </UCard>
      <UCard>
        <div class="text-center">
          <p class="text-2xl font-bold text-green-600">{{ stats.active }}</p>
          <p class="text-sm text-stone-500">Active</p>
        </div>
      </UCard>
      <UCard>
        <div class="text-center">
          <p class="text-2xl font-bold text-primary-600">
            {{ stats.totalReach.toLocaleString() }}
          </p>
          <p class="text-sm text-stone-500">Total Reach</p>
        </div>
      </UCard>
      <UCard>
        <div class="text-center">
          <p class="text-2xl font-bold text-amber-600">
            {{ stats.totalConversions }}
          </p>
          <p class="text-sm text-stone-500">Conversions</p>
        </div>
      </UCard>
    </div>

    <!-- Filters -->
    <div class="flex items-center gap-4 mb-6">
      <UInput
        v-model="searchQuery"
        placeholder="Search campaigns..."
        icon="i-heroicons-magnifying-glass"
        class="max-w-md"
      />
      <USelectMenu
        v-model="statusFilter"
        :options="statusOptions"
        value-key="value"
        class="w-48"
      />
    </div>

    <!-- Campaigns Table -->
    <UCard>
      <template #header>
        <h3 class="text-lg font-semibold text-stone-900">All Campaigns</h3>
      </template>

      <ClientOnly>
        <UTable :data="filteredCampaigns" :columns="columns">
          <template #campaign-cell="{ row }">
            <div class="flex items-center gap-3">
              <div
                class="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center"
              >
                <UIcon
                  :name="getTypeIcon(row.original.type)"
                  class="text-primary-600 text-xl"
                />
              </div>
              <div>
                <p class="font-medium text-stone-900">{{ row.original.name }}</p>
                <p class="text-xs text-stone-500">
                  {{ row.original.targetAudience }}
                </p>
              </div>
            </div>
          </template>

          <template #type-cell="{ row }">
            <UBadge color="neutral" variant="subtle">
              {{ getTypeLabel(row.original.type) }}
            </UBadge>
          </template>

          <template #status-cell="{ row }">
            <UBadge :color="getStatusColor(row.original.status)">
              {{ row.original.status.charAt(0).toUpperCase() + row.original.status.slice(1) }}
            </UBadge>
          </template>

          <template #period-cell="{ row }">
            <div class="text-sm text-stone-600">
              <p>{{ formatDate(row.original.startDate) }}</p>
              <p class="text-xs text-stone-400">
                to {{ formatDate(row.original.endDate) }}
              </p>
            </div>
          </template>

          <template #reach-cell="{ row }">
            <div class="text-sm font-medium text-stone-900">
              {{ row.original.reach.toLocaleString() }}
            </div>
          </template>

          <template #conversions-cell="{ row }">
            <div class="text-sm text-stone-600">
              {{ row.original.conversions }}
              <span
                v-if="row.original.reach > 0"
                class="text-xs text-stone-400"
              >
                ({{ ((row.original.conversions / row.original.reach) * 100).toFixed(1) }}%)
              </span>
            </div>
          </template>

          <template #actions-cell>
            <div class="flex items-center justify-end gap-2">
              <UButton
                color="neutral"
                variant="ghost"
                icon="i-heroicons-pencil"
                size="xs"
              />
              <UButton
                color="neutral"
                variant="ghost"
                icon="i-heroicons-chart-bar"
                size="xs"
              />
            </div>
          </template>
        </UTable>

        <template #fallback>
          <div class="p-4 text-center text-stone-500">Loading...</div>
        </template>
      </ClientOnly>
    </UCard>

    <!-- Create Campaign Modal -->
    <UModal v-model:open="showCreateModal">
      <template #content>
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold text-stone-900">
                Create Campaign
              </h3>
              <UButton
                color="neutral"
                variant="ghost"
                icon="i-heroicons-x-mark"
                @click="showCreateModal = false"
              />
            </div>
          </template>

          <form class="space-y-4" @submit.prevent="createCampaign">
            <div>
              <label class="block text-sm font-medium text-stone-700 mb-1">
                Campaign Name
              </label>
              <UInput
                v-model="campaignForm.name"
                placeholder="Enter campaign name"
                class="w-full"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-stone-700 mb-1">
                Campaign Type
              </label>
              <USelectMenu
                v-model="campaignForm.type"
                :options="typeOptions"
                value-key="value"
                class="w-full"
              />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-stone-700 mb-1">
                  Start Date
                </label>
                <UInput v-model="campaignForm.startDate" type="date" class="w-full" />
              </div>
              <div>
                <label class="block text-sm font-medium text-stone-700 mb-1">
                  End Date
                </label>
                <UInput v-model="campaignForm.endDate" type="date" class="w-full" />
              </div>
            </div>

            <div v-if="campaignForm.type !== 'points'">
              <label class="block text-sm font-medium text-stone-700 mb-1">
                Discount (%)
              </label>
              <UInput
                v-model.number="campaignForm.discount"
                type="number"
                min="0"
                max="100"
                class="w-full"
              />
            </div>
          </form>

          <template #footer>
            <div class="flex justify-end gap-3">
              <UButton
                color="neutral"
                variant="outline"
                @click="showCreateModal = false"
              >
                Cancel
              </UButton>
              <UButton color="primary" @click="createCampaign">
                Create Campaign
              </UButton>
            </div>
          </template>
        </UCard>
      </template>
    </UModal>
  </div>
</template>
