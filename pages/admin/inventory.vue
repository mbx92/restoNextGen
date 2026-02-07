<script setup lang="ts">
const toast = useToast();

definePageMeta({
  layout: "admin",
  middleware: ["admin-auth"],
});

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Product {
  id: string;
  name: string;
  sku?: string;
  stock?: number;
  price: number;
  isAvailable: boolean;
  category: {
    id: string;
    name: string;
  } | null;
}

const { data: categories, error: categoriesError } = await useFetch<Category[]>(
  "/api/admin/categories",
);
const { data: products, refresh: refreshProducts } = await useFetch<Product[]>(
  "/api/admin/menu/items",
);

// Transform categories to SelectMenu format
const categoryOptions = computed(() => {
  if (!categories.value || categories.value.length === 0) {
    return [{ label: "All Categories", value: "ALL" }];
  }
  const allOption = { label: "All Categories", value: "ALL" };
  const categoriesList = categories.value.map((c) => ({
    label: c.name,
    value: c.id,
  }));
  return [allOption, ...categoriesList];
});

// Search and filter
const searchQuery = ref("");
const selectedCategory = ref("ALL");

const filteredProducts = computed(() => {
  if (!products.value) return [];

  return products.value.filter((product) => {
    const matchesSearch =
      searchQuery.value === "" ||
      product.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      product.sku?.toLowerCase().includes(searchQuery.value.toLowerCase());

    const matchesCategory =
      selectedCategory.value === "ALL" ||
      product.category?.id === selectedCategory.value;

    return matchesSearch && matchesCategory;
  });
});

// Sort by stock (low to high)
const sortedProducts = computed(() => {
  return [...filteredProducts.value].sort(
    (a, b) => (a.stock || 0) - (b.stock || 0),
  );
});

// Stock update modal
const isUpdateModalOpen = ref(false);
const selectedProduct = ref<Product | null>(null);
const stockAdjustment = ref(0);
const adjustmentType = ref<"add" | "subtract" | "set">("add");
const adjustmentReason = ref("");

const openUpdateModal = (product: Product) => {
  selectedProduct.value = product;
  stockAdjustment.value = 0;
  adjustmentType.value = "add";
  adjustmentReason.value = "";
  isUpdateModalOpen.value = true;
};

const isSaving = ref(false);

const updateStock = async () => {
  if (!selectedProduct.value) return;

  try {
    isSaving.value = true;

    let newStock = selectedProduct.value.stock || 0;

    switch (adjustmentType.value) {
      case "add":
        newStock += stockAdjustment.value;
        break;
      case "subtract":
        newStock = Math.max(0, newStock - stockAdjustment.value);
        break;
      case "set":
        newStock = stockAdjustment.value;
        break;
    }

    await $fetch(`/api/admin/menu/${selectedProduct.value.id}`, {
      method: "PATCH",
      body: { stock: newStock },
    });

    toast.add({
      title: "Success",
      description: `Stock updated to ${newStock}`,
      color: "success",
    });

    await refreshProducts();
    isUpdateModalOpen.value = false;
  } catch (error) {
    console.error("Failed to update stock:", error);
    toast.add({
      title: "Error",
      description: "Failed to update stock",
      color: "error",
    });
  } finally {
    isSaving.value = false;
  }
};

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);
};

const getStockStatus = (stock: number | undefined) => {
  const s = stock || 0;
  if (s === 0) return { label: "Out of Stock", color: "error" as const };
  if (s < 10) return { label: "Low Stock", color: "warning" as const };
  if (s < 50) return { label: "Normal", color: "info" as const };
  return { label: "In Stock", color: "success" as const };
};

// Stats
const stats = computed(() => {
  const all = products.value || [];
  return {
    total: all.length,
    outOfStock: all.filter((p) => (p.stock || 0) === 0).length,
    lowStock: all.filter((p) => (p.stock || 0) > 0 && (p.stock || 0) < 10)
      .length,
    inStock: all.filter((p) => (p.stock || 0) >= 10).length,
  };
});

// Table columns
const columns = [
  { accessorKey: "name", header: "Product" },
  { accessorKey: "sku", header: "SKU" },
  { accessorKey: "category", header: "Category" },
  { accessorKey: "stock", header: "Stock" },
  { accessorKey: "status", header: "Status" },
  { accessorKey: "actions", header: "Actions" },
];
</script>

<template>
  <div>
    <div class="mb-8 flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-serif font-bold text-stone-900">Inventory</h1>
        <p class="mt-2 text-stone-600">Track and manage product stock levels</p>
      </div>
      <UButton
        to="/admin/products"
        variant="outline"
        color="neutral"
        icon="i-heroicons-cube"
      >
        Manage Products
      </UButton>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <UCard>
        <div class="text-center">
          <p class="text-2xl font-bold text-stone-900">{{ stats.total }}</p>
          <p class="text-sm text-stone-500">Total Products</p>
        </div>
      </UCard>
      <UCard>
        <div class="text-center">
          <p class="text-2xl font-bold text-red-600">{{ stats.outOfStock }}</p>
          <p class="text-sm text-stone-500">Out of Stock</p>
        </div>
      </UCard>
      <UCard>
        <div class="text-center">
          <p class="text-2xl font-bold text-amber-600">{{ stats.lowStock }}</p>
          <p class="text-sm text-stone-500">Low Stock</p>
        </div>
      </UCard>
      <UCard>
        <div class="text-center">
          <p class="text-2xl font-bold text-green-600">{{ stats.inStock }}</p>
          <p class="text-sm text-stone-500">In Stock</p>
        </div>
      </UCard>
    </div>

    <!-- Search and Filter -->
    <div class="mb-6 flex flex-col sm:flex-row gap-4">
      <UInput
        v-model="searchQuery"
        placeholder="Search by product name or SKU..."
        icon="i-heroicons-magnifying-glass"
        class="flex-1 max-w-md"
      />
      <USelectMenu
        v-model="selectedCategory"
        :items="categoryOptions"
        value-key="value"
        placeholder="Filter by category"
        class="w-full sm:w-64"
      />
    </div>

    <!-- Inventory Table -->
    <UCard>
      <ClientOnly>
        <UTable :data="sortedProducts" :columns="columns">
          <template #name-cell="{ row }">
            <div class="flex items-center gap-3">
              <div
                class="w-10 h-10 bg-stone-100 rounded-lg flex items-center justify-center"
              >
                <UIcon name="i-heroicons-cube" class="w-5 h-5 text-stone-400" />
              </div>
              <div>
                <p class="font-medium text-stone-900">
                  {{ row.original.name }}
                </p>
                <p class="text-xs text-stone-500">
                  {{ formatPrice(row.original.price) }}
                </p>
              </div>
            </div>
          </template>

          <template #sku-cell="{ row }">
            <span class="text-stone-600">{{ row.original.sku || "-" }}</span>
          </template>

          <template #category-cell="{ row }">
            <UBadge color="neutral" variant="subtle">
              {{ row.original.category?.name || "Uncategorized" }}
            </UBadge>
          </template>

          <template #stock-cell="{ row }">
            <span
              class="font-mono text-lg font-bold"
              :class="{
                'text-red-600': (row.original.stock || 0) === 0,
                'text-amber-600':
                  (row.original.stock || 0) > 0 &&
                  (row.original.stock || 0) < 10,
                'text-green-600': (row.original.stock || 0) >= 10,
              }"
            >
              {{ row.original.stock || 0 }}
            </span>
          </template>

          <template #status-cell="{ row }">
            <UBadge :color="getStockStatus(row.original.stock).color">
              {{ getStockStatus(row.original.stock).label }}
            </UBadge>
          </template>

          <template #actions-cell="{ row }">
            <UButton
              size="sm"
              color="primary"
              variant="soft"
              icon="i-heroicons-pencil-square"
              @click="openUpdateModal(row.original)"
            >
              Update Stock
            </UButton>
          </template>
        </UTable>

        <template #fallback>
          <div class="p-8 text-center text-stone-500">Loading inventory...</div>
        </template>
      </ClientOnly>

      <div
        v-if="sortedProducts.length === 0"
        class="p-8 text-center text-stone-500"
      >
        No products found
      </div>
    </UCard>

    <!-- Update Stock Modal -->
    <UModal v-model:open="isUpdateModalOpen">
      <template #content>
        <UCard v-if="selectedProduct">
          <template #header>
            <h3 class="text-lg font-semibold">Update Stock</h3>
            <p class="text-sm text-stone-500 mt-1">
              {{ selectedProduct.name }}
            </p>
          </template>

          <form class="space-y-4" @submit.prevent="updateStock">
            <div class="bg-stone-50 p-4 rounded-lg text-center">
              <p class="text-sm text-stone-500">Current Stock</p>
              <p class="text-3xl font-bold text-stone-900">
                {{ selectedProduct.stock || 0 }}
              </p>
            </div>

            <UFormField label="Adjustment Type">
              <div class="flex gap-2">
                <UButton
                  type="button"
                  :variant="adjustmentType === 'add' ? 'solid' : 'outline'"
                  :color="adjustmentType === 'add' ? 'success' : 'neutral'"
                  size="sm"
                  icon="i-heroicons-plus"
                  @click="adjustmentType = 'add'"
                >
                  Add
                </UButton>
                <UButton
                  type="button"
                  :variant="adjustmentType === 'subtract' ? 'solid' : 'outline'"
                  :color="adjustmentType === 'subtract' ? 'error' : 'neutral'"
                  size="sm"
                  icon="i-heroicons-minus"
                  @click="adjustmentType = 'subtract'"
                >
                  Subtract
                </UButton>
                <UButton
                  type="button"
                  :variant="adjustmentType === 'set' ? 'solid' : 'outline'"
                  :color="adjustmentType === 'set' ? 'info' : 'neutral'"
                  size="sm"
                  icon="i-heroicons-pencil"
                  @click="adjustmentType = 'set'"
                >
                  Set
                </UButton>
              </div>
            </UFormField>

            <UFormField
              :label="adjustmentType === 'set' ? 'New Stock Value' : 'Quantity'"
            >
              <UInput
                v-model="stockAdjustment"
                type="number"
                min="0"
                class="w-full"
              />
            </UFormField>

            <UFormField label="Reason (optional)">
              <UTextarea
                v-model="adjustmentReason"
                placeholder="e.g., Received shipment, Damaged goods, Inventory count..."
                :rows="2"
                class="w-full"
              />
            </UFormField>

            <!-- Preview -->
            <div class="bg-blue-50 p-4 rounded-lg">
              <p class="text-sm text-blue-600 mb-1">New Stock After Update</p>
              <p class="text-2xl font-bold text-blue-900">
                {{
                  adjustmentType === "add"
                    ? (selectedProduct.stock || 0) + stockAdjustment
                    : adjustmentType === "subtract"
                      ? Math.max(
                          0,
                          (selectedProduct.stock || 0) - stockAdjustment,
                        )
                      : stockAdjustment
                }}
              </p>
            </div>

            <div class="flex justify-end gap-2 pt-4">
              <UButton
                type="button"
                variant="outline"
                color="neutral"
                @click="isUpdateModalOpen = false"
              >
                Cancel
              </UButton>
              <UButton type="submit" color="primary" :loading="isSaving">
                Update Stock
              </UButton>
            </div>
          </form>
        </UCard>
      </template>
    </UModal>
  </div>
</template>
