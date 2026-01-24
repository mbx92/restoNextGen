<script setup lang="ts">
definePageMeta({
  layout: "admin",
});

const { data: orders, refresh } = await useFetch("/api/admin/orders/queue");

const updateStatus = async (orderId: string, status: string) => {
  // TODO: Implement update order status API
  console.log("Update order", orderId, "to", status);
};
</script>

<template>
  <div>
    <div class="mb-8">
      <h1 class="text-3xl font-serif font-bold text-stone-900">Order Queue</h1>
      <p class="mt-2 text-stone-600">
        Manage active orders from dine-in and takeaway
      </p>
    </div>

    <div class="space-y-4">
      <div
        v-for="order in orders"
        :key="order.id"
        class="rounded-xl border border-stone-200 bg-white p-6 shadow-sm"
      >
        <div class="mb-4 flex items-start justify-between">
          <div>
            <h3 class="text-lg font-semibold text-stone-900">
              {{ order.orderNumber }}
            </h3>
            <p class="text-sm text-stone-500">
              {{ order.type === "DINE_IN" ? "Dine In" : "Takeaway" }}
              <span v-if="order.table">
                • {{ order.table.name || order.table.tableCode }}</span
              >
            </p>
          </div>
          <select
            :value="order.status"
            @change="
              updateStatus(order.id, ($event.target as HTMLSelectElement).value)
            "
            class="rounded-lg border border-stone-300 px-3 py-1 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-100"
          >
            <option value="PLACED">Placed</option>
            <option value="ACCEPTED">Accepted</option>
            <option value="IN_KITCHEN">In Kitchen</option>
            <option value="READY">Ready</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>

        <div class="space-y-2">
          <div
            v-for="item in order.items"
            :key="item.id"
            class="flex items-center justify-between rounded-lg border border-stone-100 bg-stone-50 px-4 py-3"
          >
            <div>
              <p class="font-medium text-stone-900">{{ item.nameSnapshot }}</p>
              <p class="text-sm text-stone-500">Qty: {{ item.qty }}</p>
            </div>
            <p class="font-medium text-stone-700">
              Rp {{ item.lineTotal.toLocaleString("id-ID") }}
            </p>
          </div>
        </div>

        <div
          class="mt-4 flex items-center justify-between border-t border-stone-200 pt-4"
        >
          <p class="text-sm text-stone-600">Total</p>
          <p class="text-lg font-bold text-stone-900">
            Rp {{ order.total.toLocaleString("id-ID") }}
          </p>
        </div>
      </div>

      <div
        v-if="!orders || orders.length === 0"
        class="rounded-xl border border-stone-200 bg-white p-12 text-center shadow-sm"
      >
        <p class="text-stone-500">No active orders</p>
      </div>
    </div>
  </div>
</template>
