<script setup lang="ts">
definePageMeta({
  layout: "admin",
  middleware: ["admin-auth"],
});

interface LoyaltyTier {
  id: string;
  name: string;
  minPoints: number;
  discount: number;
  color: string;
  membersCount: number;
}

interface LoyaltyMember {
  id: string;
  customerName: string;
  phone: string;
  points: number;
  tier: string;
  totalEarned: number;
  totalRedeemed: number;
  joinedAt: string;
}

// Mock data
const tiers = ref<LoyaltyTier[]>([
  {
    id: "1",
    name: "Bronze",
    minPoints: 0,
    discount: 0,
    color: "amber",
    membersCount: 45,
  },
  {
    id: "2",
    name: "Silver",
    minPoints: 500,
    discount: 5,
    color: "neutral",
    membersCount: 20,
  },
  {
    id: "3",
    name: "Gold",
    minPoints: 1500,
    discount: 10,
    color: "warning",
    membersCount: 8,
  },
  {
    id: "4",
    name: "Platinum",
    minPoints: 5000,
    discount: 15,
    color: "primary",
    membersCount: 3,
  },
]);

const members = ref<LoyaltyMember[]>([
  {
    id: "1",
    customerName: "John Doe",
    phone: "081234567890",
    points: 2500,
    tier: "Gold",
    totalEarned: 3500,
    totalRedeemed: 1000,
    joinedAt: "2025-06-15T08:00:00Z",
  },
  {
    id: "2",
    customerName: "Jane Smith",
    phone: "081234567891",
    points: 800,
    tier: "Silver",
    totalEarned: 1200,
    totalRedeemed: 400,
    joinedAt: "2025-08-20T10:00:00Z",
  },
  {
    id: "3",
    customerName: "Bob Wilson",
    phone: "081234567892",
    points: 150,
    tier: "Bronze",
    totalEarned: 150,
    totalRedeemed: 0,
    joinedAt: "2026-01-10T12:00:00Z",
  },
]);

const searchQuery = ref("");

const filteredMembers = computed(() => {
  if (!searchQuery.value) return members.value;

  return members.value.filter(
    (m) =>
      m.customerName.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      m.phone.includes(searchQuery.value)
  );
});

const stats = computed(() => ({
  totalMembers: members.value.length,
  totalPointsIssued: members.value.reduce((sum, m) => sum + m.totalEarned, 0),
  totalPointsRedeemed: members.value.reduce(
    (sum, m) => sum + m.totalRedeemed,
    0
  ),
}));

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const getTierColor = (tier: string) => {
  const tierColors: Record<
    string,
    "neutral" | "warning" | "primary" | "success"
  > = {
    Bronze: "neutral",
    Silver: "neutral",
    Gold: "warning",
    Platinum: "primary",
  };
  return tierColors[tier] || "neutral";
};

const columns = [
  { accessorKey: "customer", header: "Customer" },
  { accessorKey: "tier", header: "Tier" },
  { accessorKey: "points", header: "Points" },
  { accessorKey: "earned", header: "Total Earned" },
  { accessorKey: "redeemed", header: "Redeemed" },
  { accessorKey: "joined", header: "Member Since" },
];
</script>

<template>
  <div>
    <div class="mb-8 flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-serif font-bold text-stone-900">
          Loyalty Program
        </h1>
        <p class="mt-2 text-stone-600">
          Manage loyalty tiers and member points
        </p>
      </div>
      <UButton color="primary" icon="i-heroicons-cog-6-tooth">
        Configure Program
      </UButton>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-3 gap-4 mb-6">
      <UCard>
        <div class="text-center">
          <p class="text-2xl font-bold text-stone-900">
            {{ stats.totalMembers }}
          </p>
          <p class="text-sm text-stone-500">Total Members</p>
        </div>
      </UCard>
      <UCard>
        <div class="text-center">
          <p class="text-2xl font-bold text-green-600">
            {{ stats.totalPointsIssued.toLocaleString() }}
          </p>
          <p class="text-sm text-stone-500">Points Issued</p>
        </div>
      </UCard>
      <UCard>
        <div class="text-center">
          <p class="text-2xl font-bold text-primary-600">
            {{ stats.totalPointsRedeemed.toLocaleString() }}
          </p>
          <p class="text-sm text-stone-500">Points Redeemed</p>
        </div>
      </UCard>
    </div>

    <!-- Loyalty Tiers -->
    <div class="mb-8">
      <h2 class="text-lg font-semibold text-stone-900 mb-4">Loyalty Tiers</h2>
      <div class="grid grid-cols-4 gap-4">
        <UCard v-for="tier in tiers" :key="tier.id">
          <div class="text-center">
            <UBadge :color="getTierColor(tier.name)" size="lg" class="mb-2">
              {{ tier.name }}
            </UBadge>
            <p class="text-xl font-bold text-stone-900">
              {{ tier.membersCount }}
            </p>
            <p class="text-sm text-stone-500">members</p>
            <p class="text-xs text-stone-400 mt-2">
              {{ tier.minPoints }}+ points • {{ tier.discount }}% discount
            </p>
          </div>
        </UCard>
      </div>
    </div>

    <!-- Search -->
    <div class="mb-6">
      <UInput
        v-model="searchQuery"
        placeholder="Search members..."
        icon="i-heroicons-magnifying-glass"
        class="max-w-md"
      />
    </div>

    <!-- Members Table -->
    <UCard>
      <template #header>
        <h3 class="text-lg font-semibold text-stone-900">Loyalty Members</h3>
      </template>

      <ClientOnly>
        <UTable :data="filteredMembers" :columns="columns">
          <template #customer-cell="{ row }">
            <div>
              <p class="font-medium text-stone-900">
                {{ row.original.customerName }}
              </p>
              <p class="text-xs text-stone-500">{{ row.original.phone }}</p>
            </div>
          </template>

          <template #tier-cell="{ row }">
            <UBadge :color="getTierColor(row.original.tier)">
              {{ row.original.tier }}
            </UBadge>
          </template>

          <template #points-cell="{ row }">
            <div class="font-semibold text-primary-600">
              {{ row.original.points.toLocaleString() }}
            </div>
          </template>

          <template #earned-cell="{ row }">
            <div class="text-sm text-stone-900">
              {{ row.original.totalEarned.toLocaleString() }}
            </div>
          </template>

          <template #redeemed-cell="{ row }">
            <div class="text-sm text-stone-600">
              {{ row.original.totalRedeemed.toLocaleString() }}
            </div>
          </template>

          <template #joined-cell="{ row }">
            <div class="text-sm text-stone-600">
              {{ formatDate(row.original.joinedAt) }}
            </div>
          </template>
        </UTable>

        <template #fallback>
          <div class="p-4 text-center text-stone-500">Loading...</div>
        </template>
      </ClientOnly>
    </UCard>
  </div>
</template>
