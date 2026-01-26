<script setup lang="ts">
definePageMeta({
  layout: "admin",
  middleware: ["admin-auth"],
});

interface DashboardStats {
  businessType: string;
  // Retail stats
  totalProducts?: number;
  lowStockProducts?: number;
  totalTransactions?: number;
  // Restaurant stats
  activeOrders?: number;
  pendingReservations?: number;
  activeTables?: number;
  // Common stats
  todayRevenue: number;
  todayTransactions: number;
}

const { data: stats } = await useFetch<DashboardStats>(
  "/api/admin/dashboard/stats",
);

const isRetail = computed(() => stats.value?.businessType === "retail");

// Only fetch orders queue for restaurant dashboard
const { data: orders } = await useFetch("/api/admin/orders/queue", {
  immediate: !isRetail.value,
  watch: false,
});

// Only fetch recent transactions for retail dashboard
const { data: recentTransactions } = await useFetch("/api/admin/orders/list", {
  immediate: isRetail.value,
  watch: false,
});

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);
};
</script>

<template>
  <div>
    <div class="mb-8">
      <h1 class="text-3xl font-serif font-bold text-stone-900">Dashboard</h1>
      <p class="mt-2 text-stone-600">
        {{
          isRetail
            ? "Overview of store operations"
            : "Overview of restaurant operations"
        }}
      </p>
    </div>

    <!-- Retail Dashboard Stats -->
    <template v-if="isRetail">
      <div class="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div class="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
          <div class="flex items-center gap-3">
            <div class="rounded-lg bg-blue-100 p-3">
              <UIcon name="i-heroicons-cube" class="h-6 w-6 text-blue-700" />
            </div>
            <div>
              <p class="text-sm font-medium text-stone-600">Total Products</p>
              <p class="text-2xl font-bold text-stone-900">
                {{ stats?.totalProducts || 0 }}
              </p>
            </div>
          </div>
        </div>

        <div class="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
          <div class="flex items-center gap-3">
            <div class="rounded-lg bg-amber-100 p-3">
              <UIcon
                name="i-heroicons-exclamation-triangle"
                class="h-6 w-6 text-amber-700"
              />
            </div>
            <div>
              <p class="text-sm font-medium text-stone-600">Low Stock</p>
              <p class="text-2xl font-bold text-stone-900">
                {{ stats?.lowStockProducts || 0 }}
              </p>
            </div>
          </div>
        </div>

        <div class="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
          <div class="flex items-center gap-3">
            <div class="rounded-lg bg-green-100 p-3">
              <UIcon
                name="i-heroicons-banknotes"
                class="h-6 w-6 text-green-700"
              />
            </div>
            <div>
              <p class="text-sm font-medium text-stone-600">Today's Sales</p>
              <p class="text-2xl font-bold text-stone-900">
                {{ formatPrice(stats?.todayRevenue || 0) }}
              </p>
            </div>
          </div>
        </div>

        <div class="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
          <div class="flex items-center gap-3">
            <div class="rounded-lg bg-purple-100 p-3">
              <UIcon
                name="i-heroicons-receipt-percent"
                class="h-6 w-6 text-purple-700"
              />
            </div>
            <div>
              <p class="text-sm font-medium text-stone-600">
                Today's Transactions
              </p>
              <p class="text-2xl font-bold text-stone-900">
                {{ stats?.todayTransactions || 0 }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Transactions for Retail -->
      <div class="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-semibold text-stone-900">
            Recent Transactions
          </h2>
          <NuxtLink
            to="/admin/transactions"
            class="text-sm text-primary-600 hover:text-primary-700"
          >
            View all →
          </NuxtLink>
        </div>
        <ClientOnly>
          <div
            v-if="recentTransactions && recentTransactions.length > 0"
            class="space-y-3"
          >
            <div
              v-for="order in recentTransactions.slice(0, 5)"
              :key="order.id"
              class="flex items-center justify-between rounded-lg border border-stone-100 p-4 hover:bg-stone-50"
            >
              <div>
                <p class="font-medium text-stone-900">
                  {{ order.orderNumber }}
                </p>
                <p class="text-sm text-stone-500">
                  {{ order.items?.length || 0 }} items •
                  {{ order.customerName || "Guest" }}
                </p>
              </div>
              <div class="text-right">
                <p class="font-semibold text-stone-900">
                  {{ formatPrice(order.total) }}
                </p>
                <span
                  class="rounded-full px-2 py-0.5 text-xs font-medium"
                  :class="{
                    'bg-green-100 text-green-800': order.status === 'COMPLETED',
                    'bg-yellow-100 text-yellow-800': order.status === 'PLACED',
                    'bg-red-100 text-red-800': order.status === 'CANCELLED',
                  }"
                >
                  {{ order.status }}
                </span>
              </div>
            </div>
          </div>
          <div v-else class="py-8 text-center text-stone-500">
            No transactions yet
          </div>
          <template #fallback>
            <div class="py-8 text-center text-stone-500">Loading...</div>
          </template>
        </ClientOnly>
      </div>
    </template>

    <!-- Restaurant Dashboard Stats -->
    <template v-else>
      <div class="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div class="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
          <div class="flex items-center gap-3">
            <div class="rounded-lg bg-amber-100 p-3">
              <UIcon
                name="i-heroicons-queue-list"
                class="h-6 w-6 text-amber-700"
              />
            </div>
            <div>
              <p class="text-sm font-medium text-stone-600">Active Orders</p>
              <p class="text-2xl font-bold text-stone-900">
                {{ stats?.activeOrders || 0 }}
              </p>
            </div>
          </div>
        </div>

        <div class="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
          <div class="flex items-center gap-3">
            <div class="rounded-lg bg-blue-100 p-3">
              <UIcon
                name="i-heroicons-calendar"
                class="h-6 w-6 text-blue-700"
              />
            </div>
            <div>
              <p class="text-sm font-medium text-stone-600">
                Pending Reservations
              </p>
              <p class="text-2xl font-bold text-stone-900">
                {{ stats?.pendingReservations || 0 }}
              </p>
            </div>
          </div>
        </div>

        <div class="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
          <div class="flex items-center gap-3">
            <div class="rounded-lg bg-green-100 p-3">
              <UIcon
                name="i-heroicons-banknotes"
                class="h-6 w-6 text-green-700"
              />
            </div>
            <div>
              <p class="text-sm font-medium text-stone-600">Today's Revenue</p>
              <p class="text-2xl font-bold text-stone-900">
                {{ formatPrice(stats?.todayRevenue || 0) }}
              </p>
            </div>
          </div>
        </div>

        <div class="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
          <div class="flex items-center gap-3">
            <div class="rounded-lg bg-purple-100 p-3">
              <UIcon
                name="i-heroicons-table-cells"
                class="h-6 w-6 text-purple-700"
              />
            </div>
            <div>
              <p class="text-sm font-medium text-stone-600">Available Tables</p>
              <p class="text-2xl font-bold text-stone-900">
                {{ stats?.activeTables || 0 }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Order Queue for Restaurant -->
      <div class="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
        <h2 class="mb-4 text-xl font-semibold text-stone-900">Order Queue</h2>
        <div v-if="orders && orders.length > 0" class="space-y-3">
          <div
            v-for="order in orders.slice(0, 5)"
            :key="order.id"
            class="flex items-center justify-between rounded-lg border border-stone-100 p-4 hover:bg-stone-50"
          >
            <div>
              <p class="font-medium text-stone-900">{{ order.orderNumber }}</p>
              <p class="text-sm text-stone-500">
                {{ order.type }} • {{ order.items.length }} items
              </p>
            </div>
            <span
              class="rounded-full px-3 py-1 text-xs font-medium"
              :class="{
                'bg-yellow-100 text-yellow-800': order.status === 'PLACED',
                'bg-blue-100 text-blue-800': order.status === 'ACCEPTED',
                'bg-purple-100 text-purple-800': order.status === 'IN_KITCHEN',
                'bg-green-100 text-green-800': order.status === 'READY',
              }"
            >
              {{ order.status }}
            </span>
          </div>
        </div>
        <div v-else class="py-8 text-center text-stone-500">
          No active orders
        </div>
      </div>
    </template>
  </div>
</template>
