<template>
  <div>
    <!-- Header -->
    <div class="mb-6 flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Subscription Plans</h1>
        <p class="text-gray-600">Manage pricing plans and subscription tiers</p>
      </div>
      <UButton
        color="primary"
        icon="i-heroicons-plus"
        @click="openCreateDialog"
      >
        Create Plan
      </UButton>
    </div>

    <!-- Plans Table -->
    <ClientOnly>
      <UCard v-if="plans">
        <UTable :data="plans" :columns="columns">
          <!-- Name Column -->
          <template #name-cell="{ row }">
            <div>
              <div class="font-semibold text-gray-900">
                {{ row.original.name }}
              </div>
              <div class="text-sm text-gray-500">{{ row.original.slug }}</div>
            </div>
          </template>

          <!-- Description Column -->
          <template #description-cell="{ row }">
            <div class="max-w-xs truncate text-sm text-gray-600">
              {{ row.original.description || "-" }}
            </div>
          </template>

          <!-- Price Column -->
          <template #price-cell="{ row }">
            <div>
              <div class="font-semibold text-gray-900">
                {{ formatPrice(row.original.price) }}
              </div>
              <div class="text-xs text-gray-500">
                /{{ row.original.billingInterval }}
              </div>
            </div>
          </template>

          <!-- Status Column -->
          <template #status-cell="{ row }">
            <UBadge
              :color="row.original.isActive ? 'success' : 'neutral'"
              variant="subtle"
            >
              {{ row.original.isActive ? "Active" : "Inactive" }}
            </UBadge>
          </template>

          <!-- Subscriptions Column -->
          <template #subscriptions-cell="{ row }">
            <div class="text-sm text-gray-700">
              {{ row.original._count?.subscriptions || 0 }}
            </div>
          </template>

          <!-- Features Column -->
          <template #features-cell="{ row }">
            <div class="text-sm text-gray-600">
              {{ row.original.features.length }} features
            </div>
          </template>

          <!-- Actions Column -->
          <template #actions-cell="{ row }">
            <div class="flex gap-2">
              <UButton
                variant="ghost"
                size="sm"
                icon="i-heroicons-sparkles"
                :to="`/platform/plans/${row.original.id}/features`"
                title="Manage Features"
              />
              <UButton
                variant="ghost"
                size="sm"
                icon="i-heroicons-pencil-square"
                @click="editPlan(row.original)"
              />
              <UButton
                variant="ghost"
                size="sm"
                color="error"
                icon="i-heroicons-trash"
                :disabled="(row.original._count?.subscriptions || 0) > 0"
                @click="deletePlan(row.original)"
              />
            </div>
          </template>
        </UTable>
      </UCard>

      <template #fallback>
        <div class="flex justify-center py-12">
          <UIcon
            name="i-heroicons-arrow-path"
            class="h-8 w-8 animate-spin text-gray-400"
          />
        </div>
      </template>
    </ClientOnly>

    <!-- Create/Edit Modal -->
    <UModal
      v-model:open="showModal"
      :title="editingPlan ? 'Edit Plan' : 'Create New Plan'"
      :ui="{ footer: 'justify-end' }"
    >
      <template #body>
        <div class="space-y-4">
          <!-- Name & Slug -->
          <div class="grid grid-cols-2 gap-4">
            <UFormField label="Name" required>
              <UInput
                v-model="formData.name"
                placeholder="e.g., Professional"
                class="w-full"
              />
            </UFormField>
            <UFormField label="Slug" required>
              <UInput
                v-model="formData.slug"
                placeholder="e.g., pro"
                :disabled="!!editingPlan"
                class="w-full"
              />
            </UFormField>
          </div>

          <!-- Description -->
          <UFormField label="Description">
            <UTextarea
              v-model="formData.description"
              placeholder="Plan description"
              rows="2"
              class="w-full"
            />
          </UFormField>

          <!-- Price & Billing -->
          <div class="grid grid-cols-2 gap-4">
            <UFormField
              label="Harga"
              description="Dalam Rupiah (tanpa desimal)"
              required
            >
              <UInput
                v-model.number="formData.price"
                type="number"
                min="0"
                placeholder="e.g., 299000 untuk Rp 2.990"
                class="w-full"
              />
            </UFormField>
            <UFormField label="Interval Billing" required>
              <USelect
                v-model="formData.billingInterval"
                :options="[
                  { value: 'month', label: 'Monthly' },
                  { value: 'year', label: 'Yearly' },
                ]"
                value-key="value"
                option-label="label"
                class="w-full"
              />
            </UFormField>
          </div>

          <!-- Features -->
          <UFormField
            label="Features"
            description="Masukkan satu fitur per baris (tekan Enter untuk baris baru)"
            help="Contoh: Unlimited menu items, 20 tables, Priority support"
          >
            <UTextarea
              v-model="featuresText"
              placeholder="Unlimited menu items&#10;20 tables&#10;5 users&#10;Priority support"
              rows="6"
              class="w-full"
            />
          </UFormField>

          <!-- Limits -->
          <UFormField
            label="Resource Limits"
            description="Batasan untuk tenant (isi -1 untuk unlimited)"
            help="Note: Fitur pembatasan belum aktif, saat ini hanya tersimpan di database"
          >
            <div class="grid grid-cols-3 gap-2">
              <UInput
                v-model.number="formData.limits.menuItems"
                type="number"
                placeholder="Menu Items"
                class="w-full"
              />
              <UInput
                v-model.number="formData.limits.tables"
                type="number"
                placeholder="Tables"
                class="w-full"
              />
              <UInput
                v-model.number="formData.limits.orders"
                type="number"
                placeholder="Orders"
                class="w-full"
              />
              <UInput
                v-model.number="formData.limits.users"
                type="number"
                placeholder="Users"
                class="w-full"
              />
              <UInput
                v-model.number="formData.limits.storage"
                type="number"
                placeholder="Storage (MB)"
                class="w-full"
              />
              <UInput
                v-model.number="formData.limits.locations"
                type="number"
                placeholder="Locations"
                class="w-full"
              />
            </div>
          </UFormField>

          <!-- Status & Order -->
          <div class="grid grid-cols-2 gap-4">
            <div class="flex items-center pt-8">
              <UCheckbox v-model="formData.isActive" label="Active" />
            </div>
            <UFormField label="Sort Order">
              <UInput
                v-model.number="formData.sortOrder"
                type="number"
                min="0"
                class="w-full"
              />
            </UFormField>
          </div>
        </div>
      </template>

      <template #footer="{ close }">
        <UButton variant="outline" @click="close"> Cancel </UButton>
        <UButton color="primary" :loading="saving" @click="savePlan">
          {{ editingPlan ? "Update" : "Create" }}
        </UButton>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: "platform",
  middleware: ["platform-auth"],
});

const toast = useToast();

// Data
const { data: plans, refresh } = await useFetch("/api/platform/plans");

const showModal = ref(false);
const saving = ref(false);
const editingPlan = ref<any>(null);

const formData = ref({
  name: "",
  slug: "",
  description: "",
  price: 0,
  billingInterval: "month",
  isActive: true,
  sortOrder: 0,
  limits: {
    menuItems: 100,
    tables: 20,
    orders: 1000,
    users: 5,
    storage: 1000,
    locations: 1,
  },
});

const featuresText = ref("");

// Table columns
const columns = [
  {
    accessorKey: "name",
    header: "Plan",
  },
  {
    accessorKey: "description",
    header: "Description",
  },
  {
    accessorKey: "price",
    header: "Price",
  },
  {
    accessorKey: "status",
    header: "Status",
  },
  {
    accessorKey: "subscriptions",
    header: "Subscriptions",
  },
  {
    accessorKey: "features",
    header: "Features",
  },
  {
    accessorKey: "actions",
    header: "Actions",
  },
];

// Methods
function formatPrice(cents: number) {
  if (cents === 0) return "Free";
  return `Rp ${(cents / 100).toLocaleString("id-ID")}`;
}

function openCreateDialog() {
  editingPlan.value = null;
  formData.value = {
    name: "",
    slug: "",
    description: "",
    price: 0,
    billingInterval: "month",
    isActive: true,
    sortOrder: 0,
    limits: {
      menuItems: 100,
      tables: 20,
      orders: 1000,
      users: 5,
      storage: 1000,
      locations: 1,
    },
  };
  featuresText.value = "";
  showModal.value = true;
}

function editPlan(plan: any) {
  editingPlan.value = plan;
  formData.value = {
    name: plan.name,
    slug: plan.slug,
    description: plan.description || "",
    price: plan.price,
    billingInterval: plan.billingInterval,
    isActive: plan.isActive,
    sortOrder: plan.sortOrder,
    limits: plan.limits,
  };
  featuresText.value = plan.features.join("\n");
  showModal.value = true;
}

async function savePlan() {
  saving.value = true;
  try {
    const features = featuresText.value
      .split("\n")
      .map((f) => f.trim())
      .filter((f) => f.length > 0);

    const payload = {
      ...formData.value,
      features,
    };

    if (editingPlan.value) {
      await $fetch(`/api/platform/plans/${editingPlan.value.id}`, {
        method: "PATCH",
        body: payload,
      });
      toast.add({
        title: "Success",
        description: "Plan updated successfully",
        color: "success",
      });
    } else {
      await $fetch("/api/platform/plans", {
        method: "POST",
        body: payload,
      });
      toast.add({
        title: "Success",
        description: "Plan created successfully",
        color: "success",
      });
    }

    showModal.value = false;
    await refresh();
  } catch (error: any) {
    toast.add({
      title: "Error",
      description: error.data?.statusMessage || "Failed to save plan",
      color: "error",
    });
  } finally {
    saving.value = false;
  }
}

async function deletePlan(plan: any) {
  if (
    !confirm(
      `Are you sure you want to delete the plan "${plan.name}"? This action cannot be undone.`,
    )
  ) {
    return;
  }

  try {
    await $fetch(`/api/platform/plans/${plan.id}`, {
      method: "DELETE",
    });
    toast.add({
      title: "Success",
      description: "Plan deleted successfully",
      color: "success",
    });
    await refresh();
  } catch (error: any) {
    toast.add({
      title: "Error",
      description: error.data?.statusMessage || "Failed to delete plan",
      color: "error",
    });
  }
}
</script>
