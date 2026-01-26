<script setup lang="ts">
definePageMeta({
  layout: "admin",
  middleware: ["admin-auth"],
});

interface Customer {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderAt: string | null;
  createdAt: string;
}

// Mock data for now - will be replaced with API
const customers = ref<Customer[]>([
  {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    phone: "081234567890",
    totalOrders: 15,
    totalSpent: 2500000,
    lastOrderAt: "2026-01-25T10:30:00Z",
    createdAt: "2025-12-01T08:00:00Z",
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane@example.com",
    phone: "081234567891",
    totalOrders: 8,
    totalSpent: 1200000,
    lastOrderAt: "2026-01-20T14:00:00Z",
    createdAt: "2025-11-15T10:00:00Z",
  },
  {
    id: "3",
    name: "Bob Wilson",
    email: null,
    phone: "081234567892",
    totalOrders: 3,
    totalSpent: 450000,
    lastOrderAt: "2026-01-10T09:00:00Z",
    createdAt: "2026-01-05T12:00:00Z",
  },
]);

const searchQuery = ref("");

const filteredCustomers = computed(() => {
  if (!searchQuery.value) return customers.value;

  return customers.value.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      c.email?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      c.phone.includes(searchQuery.value),
  );
});

const stats = computed(() => ({
  total: customers.value.length,
  active: customers.value.filter((c) => c.totalOrders > 5).length,
  totalRevenue: customers.value.reduce((sum, c) => sum + c.totalSpent, 0),
}));

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);
};

const formatDate = (dateString: string | null) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// Customer detail modal
const isDetailModalOpen = ref(false);
const selectedCustomer = ref<Customer | null>(null);

const viewCustomer = (customer: Customer) => {
  selectedCustomer.value = customer;
  isDetailModalOpen.value = true;
};

// Table columns
const columns = [
  { accessorKey: "name", header: "Customer" },
  { accessorKey: "contact", header: "Contact" },
  { accessorKey: "orders", header: "Orders" },
  { accessorKey: "spent", header: "Total Spent" },
  { accessorKey: "lastOrder", header: "Last Order" },
  { accessorKey: "actions", header: "" },
];
</script>

<template>
  <div>
    <div class="mb-8 flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-serif font-bold text-stone-900">Customers</h1>
        <p class="mt-2 text-stone-600">Manage your customer relationships</p>
      </div>
      <UButton color="primary" icon="i-heroicons-plus"> Add Customer </UButton>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-3 gap-4 mb-6">
      <UCard>
        <div class="text-center">
          <p class="text-2xl font-bold text-stone-900">{{ stats.total }}</p>
          <p class="text-sm text-stone-500">Total Customers</p>
        </div>
      </UCard>
      <UCard>
        <div class="text-center">
          <p class="text-2xl font-bold text-green-600">{{ stats.active }}</p>
          <p class="text-sm text-stone-500">Active (5+ orders)</p>
        </div>
      </UCard>
      <UCard>
        <div class="text-center">
          <p class="text-2xl font-bold text-primary-600">
            {{ formatPrice(stats.totalRevenue) }}
          </p>
          <p class="text-sm text-stone-500">Total Revenue</p>
        </div>
      </UCard>
    </div>

    <!-- Search -->
    <div class="mb-6">
      <UInput
        v-model="searchQuery"
        placeholder="Search by name, email, or phone..."
        icon="i-heroicons-magnifying-glass"
        class="max-w-md"
      />
    </div>

    <!-- Customers Table -->
    <UCard>
      <ClientOnly>
        <UTable :data="filteredCustomers" :columns="columns">
          <template #name-cell="{ row }">
            <div class="font-medium text-stone-900">
              {{ row.original.name }}
            </div>
          </template>

          <template #contact-cell="{ row }">
            <div>
              <p class="text-sm text-stone-900">{{ row.original.phone }}</p>
              <p class="text-xs text-stone-500">
                {{ row.original.email || "No email" }}
              </p>
            </div>
          </template>

          <template #orders-cell="{ row }">
            <UBadge
              :color="row.original.totalOrders > 5 ? 'success' : 'neutral'"
            >
              {{ row.original.totalOrders }} orders
            </UBadge>
          </template>

          <template #spent-cell="{ row }">
            <div class="font-semibold text-stone-900">
              {{ formatPrice(row.original.totalSpent) }}
            </div>
          </template>

          <template #lastOrder-cell="{ row }">
            <div class="text-sm text-stone-600">
              {{ formatDate(row.original.lastOrderAt) }}
            </div>
          </template>

          <template #actions-cell="{ row }">
            <UButton
              variant="ghost"
              color="neutral"
              size="sm"
              icon="i-heroicons-eye"
              @click="viewCustomer(row.original)"
            />
          </template>
        </UTable>

        <template #fallback>
          <div class="p-4 text-center text-stone-500">Loading...</div>
        </template>
      </ClientOnly>
    </UCard>

    <!-- Customer Detail Modal -->
    <UModal v-model:open="isDetailModalOpen" :ui="{ content: 'max-w-lg' }">
      <template #content>
        <UCard v-if="selectedCustomer">
          <template #header>
            <h3 class="text-lg font-semibold text-stone-900">
              Customer Details
            </h3>
          </template>

          <div class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <p class="text-xs text-stone-500">Name</p>
                <p class="font-medium text-stone-900">
                  {{ selectedCustomer.name }}
                </p>
              </div>
              <div>
                <p class="text-xs text-stone-500">Phone</p>
                <p class="font-medium text-stone-900">
                  {{ selectedCustomer.phone }}
                </p>
              </div>
              <div>
                <p class="text-xs text-stone-500">Email</p>
                <p class="font-medium text-stone-900">
                  {{ selectedCustomer.email || "-" }}
                </p>
              </div>
              <div>
                <p class="text-xs text-stone-500">Customer Since</p>
                <p class="font-medium text-stone-900">
                  {{ formatDate(selectedCustomer.createdAt) }}
                </p>
              </div>
            </div>

            <div class="border-t pt-4">
              <div class="grid grid-cols-2 gap-4">
                <div class="text-center p-4 bg-stone-50 rounded-lg">
                  <p class="text-2xl font-bold text-stone-900">
                    {{ selectedCustomer.totalOrders }}
                  </p>
                  <p class="text-sm text-stone-500">Total Orders</p>
                </div>
                <div class="text-center p-4 bg-stone-50 rounded-lg">
                  <p class="text-2xl font-bold text-primary-600">
                    {{ formatPrice(selectedCustomer.totalSpent) }}
                  </p>
                  <p class="text-sm text-stone-500">Total Spent</p>
                </div>
              </div>
            </div>
          </div>

          <template #footer>
            <div class="flex justify-end gap-2">
              <UButton
                variant="outline"
                color="neutral"
                @click="isDetailModalOpen = false"
              >
                Close
              </UButton>
            </div>
          </template>
        </UCard>
      </template>
    </UModal>
  </div>
</template>
