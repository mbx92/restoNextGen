<script setup lang="ts">
definePageMeta({
  layout: "admin",
  middleware: ["admin-auth"],
});

const router = useRouter();

interface OrderItem {
  nameSnapshot: string;
  priceSnapshot: number;
  qty: number;
  lineTotal: number;
  notes?: string;
}

interface Order {
  id: string;
  orderNumber: string;
  type: string;
  status: string;
  customerName: string | null;
  customerPhone: string | null;
  subtotal: number;
  total: number;
  createdAt: string;
  items: OrderItem[];
  payments: {
    id: string;
    amount: number;
    status: string;
    provider: string;
    paidAt: string | null;
  }[];
}

const { data: orders } = await useFetch<Order[]>("/api/admin/orders/list");

// Search and filter
const searchQuery = ref("");
const statusFilter = ref("ALL");

const statusOptions = [
  { label: "All Status", value: "ALL" },
  { label: "Placed", value: "PLACED" },
  { label: "Confirmed", value: "CONFIRMED" },
  { label: "Preparing", value: "PREPARING" },
  { label: "Ready", value: "READY" },
  { label: "Completed", value: "COMPLETED" },
  { label: "Cancelled", value: "CANCELLED" },
];

const filteredOrders = computed(() => {
  if (!orders.value) return [];

  return orders.value.filter((order) => {
    const matchesSearch =
      searchQuery.value === "" ||
      order.orderNumber
        .toLowerCase()
        .includes(searchQuery.value.toLowerCase()) ||
      order.customerName
        ?.toLowerCase()
        .includes(searchQuery.value.toLowerCase()) ||
      order.customerPhone?.includes(searchQuery.value);

    const matchesStatus =
      statusFilter.value === "ALL" || order.status === statusFilter.value;

    return matchesSearch && matchesStatus;
  });
});

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString("id-ID", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getStatusColor = (status: string) => {
  const statusMap: Record<
    string,
    "neutral" | "info" | "warning" | "success" | "error"
  > = {
    PLACED: "info",
    CONFIRMED: "info",
    PREPARING: "warning",
    READY: "warning",
    COMPLETED: "success",
    CANCELLED: "error",
  };
  return statusMap[status] || "neutral";
};

const getPaymentStatusColor = (status: string) => {
  const statusMap: Record<string, "neutral" | "success" | "error" | "warning"> =
    {
      PAID: "success",
      PENDING: "warning",
      FAILED: "error",
      REFUNDED: "neutral",
    };
  return statusMap[status] || "neutral";
};

// Stats
const stats = computed(() => {
  const all = orders.value || [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayOrders = all.filter((o) => new Date(o.createdAt) >= today);

  return {
    total: all.length,
    today: todayOrders.length,
    completed: all.filter((o) => o.status === "COMPLETED").length,
    totalRevenue: all
      .filter((o) => o.payments.some((p) => p.status === "PAID"))
      .reduce((sum, o) => sum + o.total, 0),
  };
});

// View order detail modal
const isDetailModalOpen = ref(false);
const selectedOrder = ref<Order | null>(null);

const viewOrderDetail = (order: Order) => {
  selectedOrder.value = order;
  isDetailModalOpen.value = true;
};

const closeDetailModal = () => {
  isDetailModalOpen.value = false;
  selectedOrder.value = null;
};

const openPOS = () => {
  router.push("/admin/pos");
};

// Table columns
const columns = [
  { accessorKey: "orderNumber", header: "Order #" },
  { accessorKey: "customer", header: "Customer" },
  { accessorKey: "items", header: "Items" },
  { accessorKey: "total", header: "Total" },
  { accessorKey: "payment", header: "Payment" },
  { accessorKey: "status", header: "Status" },
  { accessorKey: "date", header: "Date" },
  { accessorKey: "actions", header: "Actions" },
];
</script>

<template>
  <div>
    <div class="mb-8 flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-serif font-bold text-stone-900">
          Transactions
        </h1>
        <p class="mt-2 text-stone-600">View and manage all customer orders</p>
      </div>
      <UButton
        color="primary"
        size="lg"
        icon="i-heroicons-calculator"
        @click="openPOS"
      >
        Open POS
      </UButton>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <UCard>
        <div class="text-center">
          <p class="text-2xl font-bold text-stone-900">{{ stats.total }}</p>
          <p class="text-sm text-stone-500">Total Orders</p>
        </div>
      </UCard>
      <UCard>
        <div class="text-center">
          <p class="text-2xl font-bold text-primary-600">{{ stats.today }}</p>
          <p class="text-sm text-stone-500">Today's Orders</p>
        </div>
      </UCard>
      <UCard>
        <div class="text-center">
          <p class="text-2xl font-bold text-green-600">{{ stats.completed }}</p>
          <p class="text-sm text-stone-500">Completed</p>
        </div>
      </UCard>
      <UCard>
        <div class="text-center">
          <p class="text-2xl font-bold text-stone-900">
            {{ formatPrice(stats.totalRevenue) }}
          </p>
          <p class="text-sm text-stone-500">Total Revenue</p>
        </div>
      </UCard>
    </div>

    <!-- Search and Filter -->
    <div class="mb-6 flex flex-col sm:flex-row gap-4">
      <UInput
        v-model="searchQuery"
        placeholder="Search by order number, customer name, or phone..."
        icon="i-heroicons-magnifying-glass"
        class="flex-1 max-w-md"
      />
      <USelectMenu
        v-model="statusFilter"
        :options="statusOptions"
        placeholder="Filter by status"
        class="w-full sm:w-64"
      />
    </div>

    <!-- Orders Table -->
    <UCard>
      <ClientOnly>
        <UTable :data="filteredOrders" :columns="columns">
          <template #orderNumber-cell="{ row }">
            <div class="font-mono text-sm font-medium text-stone-900">
              {{ row.original.orderNumber }}
            </div>
          </template>

          <template #customer-cell="{ row }">
            <div>
              <p class="font-medium text-stone-900">
                {{ row.original.customerName || "Guest" }}
              </p>
              <p class="text-xs text-stone-500">
                {{ row.original.customerPhone || "-" }}
              </p>
            </div>
          </template>

          <template #items-cell="{ row }">
            <div class="text-sm text-stone-600">
              {{ row.original.items.length }} item{{
                row.original.items.length > 1 ? "s" : ""
              }}
            </div>
          </template>

          <template #total-cell="{ row }">
            <div class="font-semibold text-stone-900">
              {{ formatPrice(row.original.total) }}
            </div>
          </template>

          <template #payment-cell="{ row }">
            <template
              v-if="row.original.payments && row.original.payments.length > 0"
            >
              <UBadge
                :color="
                  getPaymentStatusColor(row.original.payments[0]?.status || '')
                "
                size="sm"
              >
                {{ row.original.payments[0]?.status || "Unknown" }}
              </UBadge>
            </template>
            <UBadge v-else color="neutral" size="sm"> No Payment </UBadge>
          </template>

          <template #status-cell="{ row }">
            <UBadge :color="getStatusColor(row.original.status)" size="sm">
              {{ row.original.status }}
            </UBadge>
          </template>

          <template #date-cell="{ row }">
            <div class="text-sm text-stone-600">
              {{ formatDate(row.original.createdAt) }}
            </div>
          </template>

          <template #actions-cell="{ row }">
            <UButton
              variant="ghost"
              color="neutral"
              size="sm"
              icon="i-heroicons-eye"
              @click="viewOrderDetail(row.original)"
            >
              View
            </UButton>
          </template>
        </UTable>

        <template #fallback>
          <div class="p-4 text-center text-stone-500">Loading...</div>
        </template>
      </ClientOnly>
    </UCard>

    <!-- Order Detail Modal -->
    <UModal v-model:open="isDetailModalOpen" :ui="{ content: 'max-w-2xl' }">
      <template #content>
        <UCard
          v-if="selectedOrder"
          :ui="{
            body: 'overflow-y-auto max-h-[60vh]',
          }"
        >
          <template #header>
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-lg font-semibold text-stone-900">
                  Order Details
                </h3>
                <p class="text-sm text-stone-500 font-mono">
                  {{ selectedOrder.orderNumber }}
                </p>
              </div>
              <UBadge :color="getStatusColor(selectedOrder.status)">
                {{ selectedOrder.status }}
              </UBadge>
            </div>
          </template>

          <!-- Customer Info -->
          <div class="mb-6">
            <h4 class="text-sm font-semibold text-stone-700 mb-2">
              Customer Information
            </h4>
            <div class="bg-stone-50 rounded-lg p-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <p class="text-xs text-stone-500">Name</p>
                  <p class="font-medium text-stone-900">
                    {{ selectedOrder.customerName || "Guest" }}
                  </p>
                </div>
                <div>
                  <p class="text-xs text-stone-500">Phone</p>
                  <p class="font-medium text-stone-900">
                    {{ selectedOrder.customerPhone || "-" }}
                  </p>
                </div>
                <div>
                  <p class="text-xs text-stone-500">Order Type</p>
                  <p class="font-medium text-stone-900">
                    {{ selectedOrder.type }}
                  </p>
                </div>
                <div>
                  <p class="text-xs text-stone-500">Date</p>
                  <p class="font-medium text-stone-900">
                    {{ formatDate(selectedOrder.createdAt) }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Order Items -->
          <div class="mb-6">
            <h4 class="text-sm font-semibold text-stone-700 mb-2">
              Order Items
            </h4>
            <div class="space-y-2">
              <div
                v-for="(item, idx) in selectedOrder.items"
                :key="idx"
                class="flex justify-between items-start p-3 bg-stone-50 rounded-lg"
              >
                <div class="flex-1">
                  <p class="font-medium text-stone-900">
                    {{ item.nameSnapshot }}
                  </p>
                  <p class="text-xs text-stone-500">
                    {{ formatPrice(item.priceSnapshot) }} × {{ item.qty }}
                  </p>
                  <p v-if="item.notes" class="text-xs text-stone-600 mt-1">
                    Note: {{ item.notes }}
                  </p>
                </div>
                <p class="font-semibold text-stone-900">
                  {{ formatPrice(item.lineTotal) }}
                </p>
              </div>
            </div>
          </div>

          <!-- Payment Info -->
          <div class="mb-6">
            <h4 class="text-sm font-semibold text-stone-700 mb-2">
              Payment Information
            </h4>
            <div
              v-if="selectedOrder.payments.length > 0"
              class="bg-stone-50 rounded-lg p-4"
            >
              <div
                v-for="payment in selectedOrder.payments"
                :key="payment.id"
                class="flex justify-between items-center"
              >
                <div>
                  <p class="text-sm font-medium text-stone-900">
                    {{ payment.provider }}
                  </p>
                  <p class="text-xs text-stone-500">
                    {{
                      payment.paidAt
                        ? formatDate(payment.paidAt)
                        : "Not paid yet"
                    }}
                  </p>
                </div>
                <div class="text-right">
                  <p class="font-semibold text-stone-900">
                    {{ formatPrice(payment.amount) }}
                  </p>
                  <UBadge
                    :color="getPaymentStatusColor(payment.status)"
                    size="sm"
                  >
                    {{ payment.status }}
                  </UBadge>
                </div>
              </div>
            </div>
            <div
              v-else
              class="bg-stone-50 rounded-lg p-4 text-center text-stone-500"
            >
              No payment recorded
            </div>
          </div>

          <!-- Total -->
          <div class="border-t border-stone-200 pt-4 pb-2">
            <div class="flex justify-between items-center mb-2">
              <span class="text-stone-600">Subtotal</span>
              <span class="font-medium text-stone-900">
                {{ formatPrice(selectedOrder.subtotal) }}
              </span>
            </div>
            <div class="flex justify-between items-center text-lg font-bold">
              <span class="text-stone-900">Total</span>
              <span class="text-stone-900">
                {{ formatPrice(selectedOrder.total) }}
              </span>
            </div>
          </div>

          <template #footer>
            <div class="flex justify-end">
              <UButton
                variant="outline"
                color="neutral"
                @click="closeDetailModal"
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
