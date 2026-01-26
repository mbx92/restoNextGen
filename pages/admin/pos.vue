<script setup lang="ts">
const toast = useToast();

definePageMeta({
  layout: "pos",
  middleware: ["admin-auth"],
});

interface Product {
  id: string;
  name: string;
  price: number;
  photoUrl: string | null;
  isAvailable: boolean;
  stock?: number;
  category: {
    id: string;
    name: string;
  } | null;
}

interface CartItem {
  product: Product;
  quantity: number;
}

const { data: products } = await useFetch<Product[]>("/api/admin/menu/items");
const { data: categories } = await useFetch<{ id: string; name: string }[]>(
  "/api/admin/categories",
);

// Cart state
const cart = ref<CartItem[]>([]);

// Order number - persist until checkout complete
const orderNumber = ref(generateOrderNumber());

function generateOrderNumber() {
  return new Date().getTime().toString().slice(-6);
}

// Search and filter
const searchQuery = ref("");
const selectedCategory = ref("ALL");

const availableProducts = computed(() => {
  if (!products.value) return [];
  return products.value.filter(
    (p) => p.isAvailable && (p.stock === undefined || p.stock > 0),
  );
});

const filteredProducts = computed(() => {
  return availableProducts.value.filter((product) => {
    const matchesSearch =
      searchQuery.value === "" ||
      product.name.toLowerCase().includes(searchQuery.value.toLowerCase());

    const matchesCategory =
      selectedCategory.value === "ALL" ||
      product.category?.id === selectedCategory.value;

    return matchesSearch && matchesCategory;
  });
});

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

// Cart functions
const addToCart = (product: Product) => {
  const existing = cart.value.find((item) => item.product.id === product.id);

  if (existing) {
    // Check stock
    if (product.stock !== undefined && existing.quantity >= product.stock) {
      toast.add({
        title: "Stock Limit",
        description: "Cannot add more than available stock",
        color: "warning",
      });
      return;
    }
    existing.quantity++;
  } else {
    cart.value.push({ product, quantity: 1 });
  }
};

const removeFromCart = (productId: string) => {
  const index = cart.value.findIndex((item) => item.product.id === productId);
  if (index !== -1) {
    cart.value.splice(index, 1);
  }
};

const updateQuantity = (productId: string, delta: number) => {
  const item = cart.value.find((i) => i.product.id === productId);
  if (!item) return;

  const newQty = item.quantity + delta;

  if (newQty <= 0) {
    removeFromCart(productId);
    return;
  }

  // Check stock
  if (item.product.stock !== undefined && newQty > item.product.stock) {
    toast.add({
      title: "Stock Limit",
      description: "Cannot add more than available stock",
      color: "warning",
    });
    return;
  }

  item.quantity = newQty;
};

const clearCart = () => {
  cart.value = [];
  orderNumber.value = generateOrderNumber();
};

// Calculations
const subtotal = computed(() => {
  return cart.value.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );
});

const tax = computed(() => subtotal.value * 0.11); // 11% PPN
const total = computed(() => subtotal.value + tax.value);

const totalItems = computed(() => {
  return cart.value.reduce((sum, item) => sum + item.quantity, 0);
});

// Payment
const paymentMethod = ref<"cash" | "card" | "qris">("cash");
const cashReceived = ref(0);
const change = computed(() => Math.max(0, cashReceived.value - total.value));

const isCheckoutModalOpen = ref(false);
const isProcessing = ref(false);

const openCheckout = () => {
  if (cart.value.length === 0) {
    toast.add({
      title: "Empty Cart",
      description: "Please add items to cart first",
      color: "warning",
    });
    return;
  }
  cashReceived.value = 0;
  isCheckoutModalOpen.value = true;
};

const processPayment = async () => {
  if (paymentMethod.value === "cash" && cashReceived.value < total.value) {
    toast.add({
      title: "Insufficient Payment",
      description: "Cash received is less than total",
      color: "error",
    });
    return;
  }

  try {
    isProcessing.value = true;

    // Create order via API
    await $fetch("/api/admin/orders/create", {
      method: "POST",
      body: {
        orderNumber: orderNumber.value,
        type: "TAKEAWAY",
        items: cart.value.map((item) => ({
          menuItemId: item.product.id,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
        })),
        subtotal: subtotal.value,
        tax: tax.value,
        total: total.value,
        paymentMethod: paymentMethod.value,
        cashReceived:
          paymentMethod.value === "cash" ? cashReceived.value : undefined,
      },
    });

    toast.add({
      title: "Payment Successful!",
      description: `Order ${orderNumber.value} - Total: ${formatPrice(total.value)}`,
      color: "success",
    });

    // Clear cart and generate new order number
    clearCart();
    isCheckoutModalOpen.value = false;
  } catch (error) {
    console.error("Payment failed:", error);
    toast.add({
      title: "Payment Failed",
      description: "Please try again",
      color: "error",
    });
  } finally {
    isProcessing.value = false;
  }
};

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);
};

// Quick amount buttons for cash
const quickAmounts = [50000, 100000, 150000, 200000, 500000];
</script>

<template>
  <div class="grid grid-cols-12 h-full bg-stone-50">
    <!-- Products Section (Left) -->
    <div
      class="col-span-8 lg:col-span-9 flex flex-col h-full border-r border-stone-200"
    >
      <!-- Search and Filter Header -->
      <div
        class="p-4 bg-white border-b border-stone-200 flex gap-3 shadow-sm z-10"
      >
        <div class="relative flex-1">
          <UIcon
            name="i-heroicons-magnifying-glass"
            class="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 w-5 h-5"
          />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search products..."
            class="w-full pl-10 pr-4 py-2 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
          />
        </div>
        <USelectMenu
          v-model="selectedCategory"
          :options="categoryOptions"
          value-key="value"
          placeholder="Filter by category"
          class="w-48"
        />
      </div>

      <!-- Products Grid -->
      <div class="flex-1 overflow-y-auto p-6 bg-stone-50">
        <div
          v-if="filteredProducts.length > 0"
          class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4"
        >
          <button
            v-for="product in filteredProducts"
            :key="product.id"
            class="group bg-white border border-stone-200 rounded-xl overflow-hidden hover:shadow-lg hover:border-primary-500 transition-all duration-200 text-left flex flex-col relative active:scale-95"
            :class="{
              'opacity-60': product.stock !== undefined && product.stock === 0,
            }"
            @click="addToCart(product)"
            :disabled="product.stock !== undefined && product.stock === 0"
          >
            <!-- Image Area -->
            <div class="aspect-4/3 bg-stone-100 relative overflow-hidden">
              <img
                v-if="product.photoUrl"
                :src="product.photoUrl"
                :alt="product.name"
                class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <div
                v-else
                class="w-full h-full flex items-center justify-center text-stone-300"
              >
                <UIcon name="i-heroicons-photo" class="w-12 h-12" />
              </div>

              <!-- Stock Badge -->
              <div
                v-if="product.stock !== undefined"
                class="absolute top-2 right-2 px-2 py-0.5 rounded text-xs font-medium backdrop-blur-md"
                :class="
                  product.stock === 0
                    ? 'bg-red-500/90 text-white'
                    : product.stock < 10
                      ? 'bg-amber-500/90 text-white'
                      : 'bg-black/50 text-white'
                "
              >
                {{
                  product.stock === 0 ? "Out of Stock" : `${product.stock} Left`
                }}
              </div>
            </div>

            <!-- Content Area -->
            <div class="p-4 flex-1 flex flex-col justify-between">
              <div>
                <p class="text-xs text-stone-500 mb-1">
                  {{ product.category?.name || "Uncategorized" }}
                </p>
                <h3
                  class="font-bold text-stone-900 leading-tight mb-2 line-clamp-2"
                >
                  {{ product.name }}
                </h3>
              </div>
              <p class="text-lg font-bold text-primary-600">
                {{ formatPrice(product.price) }}
              </p>
            </div>
          </button>
        </div>

        <!-- Empty State -->
        <div
          v-else
          class="h-full flex flex-col items-center justify-center text-stone-400"
        >
          <div
            class="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mb-4"
          >
            <UIcon name="i-heroicons-magnifying-glass" class="w-10 h-10" />
          </div>
          <p class="text-lg font-medium text-stone-600">No products found</p>
          <p class="text-sm">Try adjusting your search or filter</p>
        </div>
      </div>
    </div>

    <!-- Cart Section (Right) -->
    <div
      class="col-span-4 lg:col-span-3 flex flex-col h-full bg-white shadow-xl z-20"
    >
      <!-- Cart Header -->
      <div
        class="p-4 border-b border-stone-200 bg-white flex items-center justify-between"
      >
        <div>
          <h2 class="font-bold text-lg text-stone-900">Current Order</h2>
          <p class="text-xs text-stone-500">Order #{{ orderNumber }}</p>
        </div>
        <UButton
          v-if="cart.length > 0"
          size="xs"
          variant="ghost"
          color="error"
          icon="i-heroicons-trash"
          @click="clearCart"
        >
          Clear
        </UButton>
      </div>

      <!-- Cart Items -->
      <div class="flex-1 overflow-y-auto p-4 space-y-3">
        <template v-if="cart.length > 0">
          <div
            v-for="item in cart"
            :key="item.product.id"
            class="group bg-stone-50 hover:bg-white border border-transparent hover:border-stone-200 rounded-lg p-3 transition-all duration-200"
          >
            <div class="flex gap-3">
              <!-- Item details -->
              <div class="flex-1">
                <div class="flex justify-between items-start mb-1">
                  <h4 class="font-medium text-stone-900 text-sm line-clamp-1">
                    {{ item.product.name }}
                  </h4>
                  <p class="font-bold text-stone-900 text-sm">
                    {{ formatPrice(item.product.price * item.quantity) }}
                  </p>
                </div>
                <p class="text-xs text-stone-500 mb-2">
                  {{ formatPrice(item.product.price) }} / unit
                </p>

                <!-- Controls -->
                <div class="flex items-center justify-between">
                  <div
                    class="flex items-center gap-1 bg-white rounded-lg border border-stone-200 p-0.5"
                  >
                    <button
                      class="w-7 h-7 flex items-center justify-center rounded-md hover:bg-stone-100 text-stone-600 transition-colors"
                      @click="updateQuantity(item.product.id, -1)"
                    >
                      <UIcon name="i-heroicons-minus" class="w-4 h-4" />
                    </button>
                    <span class="w-8 text-center font-bold text-sm">{{
                      item.quantity
                    }}</span>
                    <button
                      class="w-7 h-7 flex items-center justify-center rounded-md hover:bg-stone-100 text-stone-600 transition-colors"
                      @click="updateQuantity(item.product.id, 1)"
                    >
                      <UIcon name="i-heroicons-plus" class="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    class="text-stone-400 hover:text-red-500 transition-colors p-1"
                    @click="removeFromCart(item.product.id)"
                  >
                    <UIcon name="i-heroicons-trash" class="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- Empty Cart State -->
        <div
          v-else
          class="h-full flex flex-col items-center justify-center text-stone-400 opacity-60"
        >
          <UIcon name="i-heroicons-shopping-cart" class="w-16 h-16 mb-4" />
          <p class="text-lg font-medium">Cart is empty</p>
          <p class="text-sm">Tap products to add items</p>
        </div>
      </div>

      <!-- Cart Footer -->
      <div class="bg-stone-50 p-4 border-t border-stone-200 space-y-4">
        <!-- Summary -->
        <div class="space-y-2">
          <div class="flex justify-between text-sm text-stone-600">
            <span>Subtotal</span>
            <span>{{ formatPrice(subtotal) }}</span>
          </div>
          <div class="flex justify-between text-sm text-stone-600">
            <span>Tax (11%)</span>
            <span>{{ formatPrice(tax) }}</span>
          </div>
          <div
            class="flex justify-between text-xl font-bold text-stone-900 pt-2 border-t border-stone-200"
          >
            <span>Total</span>
            <span class="text-primary-600">{{ formatPrice(total) }}</span>
          </div>
        </div>

        <!-- Checkout Button -->
        <button
          class="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-stone-300 disabled:cursor-not-allowed text-white font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-primary-500/30 disabled:shadow-none"
          :disabled="cart.length === 0"
          @click="openCheckout"
        >
          <span>Checkout</span>
          <UIcon name="i-heroicons-arrow-right" class="w-5 h-5" />
        </button>
      </div>
    </div>

    <!-- Checkout Modal -->
    <UModal v-model:open="isCheckoutModalOpen" :ui="{ content: 'max-w-md' }">
      <template #content>
        <UCard>
          <template #header>
            <h3 class="text-xl font-bold text-center">Payment</h3>
          </template>

          <div class="space-y-6 py-2">
            <!-- Payment Method Selection -->
            <div>
              <label class="text-sm font-medium text-stone-700 block mb-3"
                >Select Payment Method</label
              >
              <div class="grid grid-cols-3 gap-3">
                <button
                  v-for="method in ['cash', 'card', 'qris']"
                  :key="method"
                  class="flex flex-col items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all duration-200"
                  :class="
                    paymentMethod === method
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-stone-100 bg-stone-50 text-stone-600 hover:border-stone-200'
                  "
                  @click="paymentMethod = method as any"
                >
                  <UIcon
                    :name="
                      method === 'cash'
                        ? 'i-heroicons-banknotes'
                        : method === 'card'
                          ? 'i-heroicons-credit-card'
                          : 'i-heroicons-qr-code'
                    "
                    class="w-6 h-6"
                  />
                  <span class="text-xs font-bold uppercase tracking-wider">{{
                    method
                  }}</span>
                </button>
              </div>
            </div>

            <!-- Cash Payment Input -->
            <div
              v-if="paymentMethod === 'cash'"
              class="space-y-4 animate-fade-in"
            >
              <div>
                <label class="text-sm font-medium text-stone-700 mb-1 block"
                  >Cash Received</label
                >
                <div class="relative">
                  <span
                    class="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500 font-bold"
                    >Rp</span
                  >
                  <input
                    v-model="cashReceived"
                    type="number"
                    class="w-full pl-10 pr-4 py-3 text-lg font-bold text-right rounded-lg border border-stone-200 focus:ring-2 focus:ring-primary-500 focus:outline-none"
                    placeholder="0"
                  />
                </div>
              </div>

              <!-- Quick Amounts -->
              <div class="grid grid-cols-3 gap-2">
                <button
                  v-for="amount in quickAmounts"
                  :key="amount"
                  class="px-2 py-2 text-xs font-medium bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg transition-colors"
                  @click="cashReceived = amount"
                >
                  {{ formatPrice(amount) }}
                </button>
                <button
                  class="px-2 py-2 text-xs font-bold bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors"
                  @click="cashReceived = total"
                >
                  Uang Pas
                </button>
              </div>

              <!-- Change Display -->
              <div class="bg-stone-900 rounded-xl p-4 text-white">
                <div class="flex justify-between items-center mb-1">
                  <span class="text-stone-400 text-sm">Total Bill</span>
                  <span class="font-medium">{{ formatPrice(total) }}</span>
                </div>
                <div
                  class="flex justify-between items-center border-t border-stone-700 pt-2 mt-2"
                >
                  <span class="text-stone-300">Change</span>
                  <span
                    class="text-2xl font-bold"
                    :class="
                      cashReceived >= total ? 'text-green-400' : 'text-red-400'
                    "
                  >
                    {{
                      cashReceived >= total
                        ? formatPrice(change)
                        : "-" + formatPrice(total - cashReceived)
                    }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Non-Cash State -->
            <div
              v-else
              class="py-8 text-center bg-stone-50 rounded-xl border border-dashed border-stone-200"
            >
              <div
                class="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm"
              >
                <UIcon
                  :name="
                    paymentMethod === 'card'
                      ? 'i-heroicons-credit-card'
                      : 'i-heroicons-qr-code'
                  "
                  class="w-8 h-8 text-primary-500"
                />
              </div>
              <p class="text-stone-900 font-medium mb-1">
                Waiting for payment...
              </p>
              <p class="text-stone-500 text-sm">
                Please proceed with the EDC machine or QR scanner
              </p>
            </div>
          </div>

          <template #footer>
            <div class="flex gap-3">
              <UButton
                variant="outline"
                color="neutral"
                block
                class="flex-1"
                @click="isCheckoutModalOpen = false"
              >
                Cancel
              </UButton>
              <UButton
                color="primary"
                block
                class="flex-1 font-bold"
                size="lg"
                :loading="isProcessing"
                :disabled="paymentMethod === 'cash' && cashReceived < total"
                @click="processPayment"
              >
                Complete Order
              </UButton>
            </div>
          </template>
        </UCard>
      </template>
    </UModal>
  </div>
</template>
