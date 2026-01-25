<script setup lang="ts">
definePageMeta({
  layout: "admin",
  middleware: ["admin-auth"],
});

const { data: tables, refresh } = await useFetch("/api/admin/tables/index");

const isAdding = ref(false);
const tableForm = ref({
  tableCode: "",
  name: "",
  capacity: 2,
  isActive: true,
});

const addTable = async () => {
  await $fetch("/api/admin/tables/index", {
    method: "POST",
    body: tableForm.value,
  });
  await refresh();
  isAdding.value = false;
  tableForm.value = { tableCode: "", name: "", capacity: 2, isActive: true };
};
</script>

<template>
  <div>
    <div class="mb-8">
      <h1 class="text-3xl font-serif font-bold text-stone-900">Tables</h1>
      <p class="mt-2 text-stone-600">Manage restaurant tables and QR codes</p>
    </div>

    <div class="mb-6">
      <UButton
        color="neutral"
        class="!bg-amber-700 !text-white hover:!bg-amber-800"
        @click="isAdding = !isAdding"
      >
        <UIcon name="i-heroicons-plus" class="h-5 w-5" />
        Add Table
      </UButton>
    </div>

    <!-- Add Form -->
    <div
      v-if="isAdding"
      class="mb-6 rounded-xl border border-stone-200 bg-white p-6 shadow-sm"
    >
      <h3 class="mb-4 text-lg font-semibold text-stone-900">New Table</h3>
      <div class="grid gap-4 sm:grid-cols-2">
        <div>
          <label class="mb-2 block text-sm font-medium text-stone-700"
            >Table Code (for QR)</label
          >
          <input
            v-model="tableForm.tableCode"
            type="text"
            placeholder="e.g., T01"
            class="w-full rounded-lg border border-stone-300 px-4 py-2 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-100"
          >
        </div>
        <div>
          <label class="mb-2 block text-sm font-medium text-stone-700"
            >Table Name</label
          >
          <input
            v-model="tableForm.name"
            type="text"
            placeholder="e.g., Table 1"
            class="w-full rounded-lg border border-stone-300 px-4 py-2 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-100"
          >
        </div>
        <div>
          <label class="mb-2 block text-sm font-medium text-stone-700"
            >Capacity</label
          >
          <input
            v-model.number="tableForm.capacity"
            type="number"
            min="1"
            class="w-full rounded-lg border border-stone-300 px-4 py-2 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-100"
          >
        </div>
      </div>
      <div class="mt-4 flex gap-3">
        <UButton
          color="neutral"
          class="!bg-amber-700 !text-white hover:!bg-amber-800"
          @click="addTable"
        >
          Save Table
        </UButton>
        <UButton
          color="neutral"
          variant="outline"
          class="!border-stone-300 !text-stone-700 hover:!bg-stone-50"
          @click="isAdding = false"
        >
          Cancel
        </UButton>
      </div>
    </div>

    <!-- Tables List -->
    <div class="rounded-xl border border-stone-200 bg-white shadow-sm">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="border-b border-stone-200 bg-stone-50">
            <tr>
              <th
                class="px-6 py-3 text-left text-sm font-semibold text-stone-700"
              >
                Code
              </th>
              <th
                class="px-6 py-3 text-left text-sm font-semibold text-stone-700"
              >
                Name
              </th>
              <th
                class="px-6 py-3 text-left text-sm font-semibold text-stone-700"
              >
                Capacity
              </th>
              <th
                class="px-6 py-3 text-left text-sm font-semibold text-stone-700"
              >
                Status
              </th>
              <th
                class="px-6 py-3 text-left text-sm font-semibold text-stone-700"
              >
                QR Code
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-stone-100">
            <tr
              v-for="table in tables"
              :key="table.id"
              class="hover:bg-stone-50"
            >
              <td class="px-6 py-4 text-sm font-medium text-stone-900">
                {{ table.tableCode }}
              </td>
              <td class="px-6 py-4 text-sm text-stone-700">
                {{ table.name || "-" }}
              </td>
              <td class="px-6 py-4 text-sm text-stone-700">
                {{ table.capacity }} seats
              </td>
              <td class="px-6 py-4">
                <span
                  class="rounded-full px-3 py-1 text-xs font-medium"
                  :class="
                    table.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-stone-100 text-stone-600'
                  "
                >
                  {{ table.isActive ? "Active" : "Inactive" }}
                </span>
              </td>
              <td class="px-6 py-4">
                <UButton
                  size="sm"
                  color="neutral"
                  variant="ghost"
                  class="!text-amber-700 hover:!bg-amber-50"
                >
                  Generate QR
                </UButton>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div
        v-if="!tables || tables.length === 0"
        class="py-12 text-center text-stone-500"
      >
        No tables configured
      </div>
    </div>
  </div>
</template>
