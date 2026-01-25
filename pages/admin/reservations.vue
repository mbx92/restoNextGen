<script setup lang="ts">
definePageMeta({
  layout: "admin",
  middleware: ["admin-auth"],
});

const statusFilter = ref("PENDING");
const { data: reservations, refresh } = await useFetch(
  "/api/admin/reservations/index",
  {
    query: { status: statusFilter },
  },
);
</script>

<template>
  <div>
    <div class="mb-8">
      <h1 class="text-3xl font-serif font-bold text-stone-900">Reservations</h1>
      <p class="mt-2 text-stone-600">
        Manage table reservations and confirmations
      </p>
    </div>

    <div class="mb-6">
      <select
        v-model="statusFilter"
        class="rounded-lg border border-stone-300 px-4 py-2 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-100"
        @change="refresh"
      >
        <option value="">All Reservations</option>
        <option value="PENDING">Pending</option>
        <option value="CONFIRMED">Confirmed</option>
        <option value="CANCELLED">Cancelled</option>
        <option value="COMPLETED">Completed</option>
      </select>
    </div>

    <div class="space-y-4">
      <div
        v-for="res in reservations"
        :key="res.id"
        class="rounded-xl border border-stone-200 bg-white p-6 shadow-sm"
      >
        <div class="flex items-start justify-between">
          <div>
            <h3 class="text-lg font-semibold text-stone-900">
              {{ res.customerName }}
            </h3>
            <p class="text-sm text-stone-500">{{ res.customerPhone }}</p>
            <p class="mt-2 text-stone-700">
              {{ new Date(res.startAt).toLocaleString("id-ID") }}
            </p>
            <p class="text-sm text-stone-600">
              {{ res.partySize }} guests
              <span v-if="res.table">
                • {{ res.table.name || res.table.tableCode }}</span
              >
            </p>
            <p v-if="res.notes" class="mt-2 text-sm italic text-stone-500">
              Note: {{ res.notes }}
            </p>
          </div>
          <span
            class="rounded-full px-3 py-1 text-xs font-medium"
            :class="{
              'bg-yellow-100 text-yellow-800': res.status === 'PENDING',
              'bg-green-100 text-green-800': res.status === 'CONFIRMED',
              'bg-red-100 text-red-800': res.status === 'CANCELLED',
              'bg-stone-100 text-stone-600': res.status === 'COMPLETED',
            }"
          >
            {{ res.status }}
          </span>
        </div>

        <div v-if="res.status === 'PENDING'" class="mt-4 flex gap-3">
          <UButton
            color="neutral"
            class="!bg-green-600 !text-white hover:!bg-green-700"
          >
            Confirm
          </UButton>
          <UButton
            color="neutral"
            variant="outline"
            class="!border-red-300 !text-red-700 hover:!bg-red-50"
          >
            Cancel
          </UButton>
        </div>
      </div>

      <div
        v-if="!reservations || reservations.length === 0"
        class="rounded-xl border border-stone-200 bg-white p-12 text-center shadow-sm"
      >
        <p class="text-stone-500">No reservations found</p>
      </div>
    </div>
  </div>
</template>
