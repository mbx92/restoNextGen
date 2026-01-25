<script setup lang="ts">
definePageMeta({
  layout: "admin",
  middleware: ["admin-auth"],
});

const { data: _stats } = await useFetch("/api/admin/dashboard/stats");
const { data: orders } = await useFetch("/api/admin/orders/queue");
const { data: reservations } = await useFetch("/api/admin/reservations/index", {
  query: { status: "PENDING" },
});
</script>

<template>
  <div>
    <div class="mb-8">
      <h1 class="text-3xl font-serif font-bold text-stone-900">Dashboard</h1>
      <p class="mt-2 text-stone-600">Overview of restaurant operations</p>
    </div>

    <!-- Stats Grid -->
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
              {{ orders?.length || 0 }}
            </p>
          </div>
        </div>
      </div>

      <div class="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
        <div class="flex items-center gap-3">
          <div class="rounded-lg bg-blue-100 p-3">
            <UIcon name="i-heroicons-calendar" class="h-6 w-6 text-blue-700" />
          </div>
          <div>
            <p class="text-sm font-medium text-stone-600">
              Pending Reservations
            </p>
            <p class="text-2xl font-bold text-stone-900">
              {{ reservations?.length || 0 }}
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
            <p class="text-2xl font-bold text-stone-900">Rp 0</p>
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
            <p class="text-2xl font-bold text-stone-900">-</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Orders -->
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
      <div v-else class="py-8 text-center text-stone-500">No active orders</div>
    </div>
  </div>
</template>
