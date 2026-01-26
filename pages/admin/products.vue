<script setup lang="ts">
const { confirm } = useConfirmDialog();
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
  categoryId: string | null;
  name: string;
  description: string | null;
  price: number;
  photoUrl: string | null;
  isAvailable: boolean;
  isFeatured: boolean;
  sortOrder: number;
  stock?: number;
  sku?: string;
  category: Category | null;
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
      product.categoryId === selectedCategory.value;

    return matchesSearch && matchesCategory;
  });
});

const isModalOpen = ref(false);
const editingProduct = ref<Product | null>(null);
const productForm = ref({
  categoryId: "",
  name: "",
  description: "",
  price: 0,
  photoUrl: "",
  isAvailable: true,
  isFeatured: false,
  sortOrder: 0,
  stock: 0,
  sku: "",
});

const openCreateModal = () => {
  editingProduct.value = null;
  productForm.value = {
    categoryId: "",
    name: "",
    description: "",
    price: 0,
    photoUrl: "",
    isAvailable: true,
    isFeatured: false,
    sortOrder: 0,
    stock: 0,
    sku: "",
  };
  isModalOpen.value = true;
};

const openEditModal = (product: Product) => {
  editingProduct.value = product;
  productForm.value = {
    categoryId: product.categoryId || "",
    name: product.name,
    description: product.description || "",
    price: product.price,
    photoUrl: product.photoUrl || "",
    isAvailable: product.isAvailable,
    isFeatured: product.isFeatured,
    sortOrder: product.sortOrder,
    stock: product.stock || 0,
    sku: product.sku || "",
  };
  isModalOpen.value = true;
};

const isSaving = ref(false);

const saveProduct = async () => {
  try {
    isSaving.value = true;
    if (editingProduct.value) {
      await $fetch(`/api/admin/menu/${editingProduct.value.id}`, {
        method: "PATCH",
        body: productForm.value,
      });
      toast.add({
        title: "Success",
        description: "Product updated successfully",
        color: "success",
      });
    } else {
      await $fetch("/api/admin/menu/items", {
        method: "POST",
        body: productForm.value,
      });
      toast.add({
        title: "Success",
        description: "Product created successfully",
        color: "success",
      });
    }
    await refreshProducts();
    isModalOpen.value = false;
  } catch (error) {
    console.error("Failed to save product:", error);
    toast.add({
      title: "Error",
      description: "Failed to save product",
      color: "error",
    });
  } finally {
    isSaving.value = false;
  }
};

const deleteProduct = async (product: Product) => {
  const confirmed = await confirm({
    title: "Delete Product",
    message: `Are you sure you want to delete "${product.name}"?`,
    confirmText: "Delete",
    confirmColor: "error",
  });
  if (!confirmed) return;

  try {
    await $fetch(`/api/admin/menu/${product.id}`, {
      method: "DELETE",
    });
    toast.add({
      title: "Success",
      description: "Product deleted successfully",
      color: "success",
    });
    await refreshProducts();
  } catch (error) {
    console.error("Failed to delete product:", error);
    toast.add({
      title: "Error",
      description: "Failed to delete product",
      color: "error",
    });
  }
};

const toggleAvailability = async (product: Product) => {
  try {
    await $fetch(`/api/admin/menu/${product.id}`, {
      method: "PATCH",
      body: { isAvailable: !product.isAvailable },
    });
    await refreshProducts();
  } catch (error) {
    console.error("Failed to toggle availability:", error);
  }
};

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);
};

// Group products by category
const groupedProducts = computed(() => {
  if (!filteredProducts.value) return {};
  return filteredProducts.value.reduce(
    (acc, product) => {
      const key = product.category?.name || "Uncategorized";
      if (!acc[key]) acc[key] = [];
      acc[key].push(product);
      return acc;
    },
    {} as Record<string, Product[]>,
  );
});

// Stats
const stats = computed(() => ({
  total: products.value?.length || 0,
  available: products.value?.filter((p) => p.isAvailable).length || 0,
  featured: products.value?.filter((p) => p.isFeatured).length || 0,
  lowStock: products.value?.filter((p) => (p.stock || 0) < 10).length || 0,
}));
</script>

<template>
  <div>
    <div class="mb-8 flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-serif font-bold text-stone-900">Products</h1>
        <p class="mt-2 text-stone-600">Manage your product catalog</p>
      </div>
      <div class="flex gap-2">
        <UButton
          to="/admin/categories"
          variant="outline"
          color="neutral"
          icon="i-heroicons-folder"
        >
          Categories
        </UButton>
        <UButton
          color="primary"
          icon="i-heroicons-plus"
          @click="openCreateModal"
        >
          Add Product
        </UButton>
      </div>
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
          <p class="text-2xl font-bold text-green-600">{{ stats.available }}</p>
          <p class="text-sm text-stone-500">Available</p>
        </div>
      </UCard>
      <UCard>
        <div class="text-center">
          <p class="text-2xl font-bold text-amber-600">{{ stats.featured }}</p>
          <p class="text-sm text-stone-500">Featured</p>
        </div>
      </UCard>
      <UCard>
        <div class="text-center">
          <p class="text-2xl font-bold text-red-600">{{ stats.lowStock }}</p>
          <p class="text-sm text-stone-500">Low Stock</p>
        </div>
      </UCard>
    </div>

    <!-- Search and Filter -->
    <div class="flex flex-col sm:flex-row gap-4 mb-6">
      <UInput
        v-model="searchQuery"
        placeholder="Search products..."
        icon="i-heroicons-magnifying-glass"
        class="flex-1"
      />
      <USelectMenu
        v-model="selectedCategory"
        :options="categoryOptions"
        value-key="value"
        placeholder="Filter by category"
        class="w-full sm:w-48"
      />
    </div>

    <!-- Error message -->
    <div
      v-if="categoriesError"
      class="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg"
    >
      <p class="text-red-600 text-sm">
        Error loading categories: {{ categoriesError }}
      </p>
    </div>

    <!-- Products Grid -->
    <div
      v-if="filteredProducts && filteredProducts.length > 0"
      class="space-y-8"
    >
      <div
        v-for="(categoryProducts, categoryName) in groupedProducts"
        :key="categoryName"
      >
        <h2
          class="text-xl font-semibold text-stone-900 mb-4 flex items-center gap-2"
        >
          <UIcon name="i-heroicons-folder" class="w-5 h-5" />
          {{ categoryName }}
          <UBadge color="neutral" size="sm">{{
            categoryProducts.length
          }}</UBadge>
        </h2>
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <UCard
            v-for="product in categoryProducts"
            :key="product.id"
            class="hover:shadow-lg transition-shadow"
            :class="{ 'opacity-60': !product.isAvailable }"
          >
            <div class="space-y-3">
              <!-- Image -->
              <div
                v-if="product.photoUrl"
                class="w-full h-40 bg-stone-200 rounded-lg overflow-hidden"
              >
                <img
                  :src="product.photoUrl"
                  :alt="product.name"
                  class="w-full h-full object-cover"
                />
              </div>
              <div
                v-else
                class="w-full h-40 bg-stone-100 rounded-lg flex items-center justify-center"
              >
                <UIcon
                  name="i-heroicons-cube"
                  class="w-12 h-12 text-stone-300"
                />
              </div>

              <!-- Product Info -->
              <div>
                <div class="flex items-start justify-between gap-2">
                  <h3 class="font-semibold text-stone-900 line-clamp-1">
                    {{ product.name }}
                  </h3>
                </div>

                <!-- SKU -->
                <p v-if="product.sku" class="text-xs text-stone-400 mt-1">
                  SKU: {{ product.sku }}
                </p>

                <!-- Badges -->
                <div class="flex flex-wrap gap-1 mt-2">
                  <UBadge v-if="product.isFeatured" color="primary" size="xs">
                    Featured
                  </UBadge>
                  <UBadge v-if="!product.isAvailable" color="neutral" size="xs">
                    Unavailable
                  </UBadge>
                  <UBadge
                    v-if="(product.stock || 0) < 10"
                    color="warning"
                    size="xs"
                  >
                    Low Stock
                  </UBadge>
                </div>

                <p
                  v-if="product.description"
                  class="text-sm text-stone-600 mt-2 line-clamp-2"
                >
                  {{ product.description }}
                </p>

                <!-- Price and Stock -->
                <div class="flex items-center justify-between mt-3">
                  <p class="text-lg font-bold text-theme-primary">
                    {{ formatPrice(product.price) }}
                  </p>
                  <p class="text-sm text-stone-500">
                    Stock: {{ product.stock || 0 }}
                  </p>
                </div>
              </div>

              <!-- Actions -->
              <div class="flex gap-2 pt-2 border-t border-stone-100">
                <UButton
                  variant="ghost"
                  color="neutral"
                  size="sm"
                  icon="i-heroicons-pencil"
                  @click="openEditModal(product)"
                >
                  Edit
                </UButton>
                <UButton
                  variant="ghost"
                  :color="product.isAvailable ? 'warning' : 'success'"
                  size="sm"
                  :icon="
                    product.isAvailable
                      ? 'i-heroicons-eye-slash'
                      : 'i-heroicons-eye'
                  "
                  @click="toggleAvailability(product)"
                >
                  {{ product.isAvailable ? "Hide" : "Show" }}
                </UButton>
                <UButton
                  variant="ghost"
                  color="error"
                  size="sm"
                  icon="i-heroicons-trash"
                  @click="deleteProduct(product)"
                />
              </div>
            </div>
          </UCard>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-else
      class="text-center py-16 bg-stone-50 rounded-lg border border-dashed border-stone-300"
    >
      <UIcon
        name="i-heroicons-cube"
        class="w-16 h-16 mx-auto text-stone-300 mb-4"
      />
      <h3 class="text-lg font-medium text-stone-700 mb-2">No products yet</h3>
      <p class="text-stone-500 mb-4">
        Get started by adding your first product
      </p>
      <UButton color="primary" @click="openCreateModal">Add Product</UButton>
    </div>

    <!-- Create/Edit Modal -->
    <UModal v-model:open="isModalOpen">
      <template #content>
        <UCard>
          <template #header>
            <h3 class="text-lg font-semibold">
              {{ editingProduct ? "Edit Product" : "Add New Product" }}
            </h3>
          </template>

          <form class="space-y-4" @submit.prevent="saveProduct">
            <UFormField label="Product Name" required>
              <UInput
                v-model="productForm.name"
                placeholder="e.g., Wireless Mouse"
                class="w-full"
              />
            </UFormField>

            <div class="grid grid-cols-2 gap-4">
              <UFormField label="SKU">
                <UInput
                  v-model="productForm.sku"
                  placeholder="e.g., WM-001"
                  class="w-full"
                />
              </UFormField>

              <UFormField label="Category">
                <USelectMenu
                  v-model="productForm.categoryId"
                  :items="categoryOptions"
                  placeholder="Select category"
                  value-key="value"
                  class="w-full"
                />
              </UFormField>
            </div>

            <UFormField label="Description">
              <UTextarea
                v-model="productForm.description"
                placeholder="Product description..."
                :rows="3"
                class="w-full"
              />
            </UFormField>

            <div class="grid grid-cols-2 gap-4">
              <UFormField label="Price (IDR)" required>
                <UInput
                  v-model="productForm.price"
                  type="number"
                  min="0"
                  class="w-full"
                />
              </UFormField>

              <UFormField label="Stock">
                <UInput
                  v-model="productForm.stock"
                  type="number"
                  min="0"
                  class="w-full"
                />
              </UFormField>
            </div>

            <UFormField label="Photo URL">
              <UInput
                v-model="productForm.photoUrl"
                placeholder="https://..."
                class="w-full"
              />
            </UFormField>

            <div class="flex gap-6">
              <UCheckbox
                v-model="productForm.isAvailable"
                label="Available for sale"
              />
              <UCheckbox
                v-model="productForm.isFeatured"
                label="Featured product"
              />
            </div>

            <div class="flex justify-end gap-2 pt-4">
              <UButton
                type="button"
                variant="outline"
                color="neutral"
                @click="isModalOpen = false"
              >
                Cancel
              </UButton>
              <UButton type="submit" color="primary" :loading="isSaving">
                {{ editingProduct ? "Update" : "Create" }}
              </UButton>
            </div>
          </form>
        </UCard>
      </template>
    </UModal>
  </div>
</template>
