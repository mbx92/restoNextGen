<script setup lang="ts">
const toast = useToast();

definePageMeta({
  layout: "admin",
  middleware: ["admin-auth"],
});

const { data: settings, refresh: refreshSettings } = await useFetch<{
  id: string;
  tenantId: string;
  enableTax: boolean;
  taxRate: number;
  taxName: string;
  currency: string;
  timezone: string;
  businessHours: Record<string, unknown> | null;
  enableInventoryTracking: boolean;
  lowStockThreshold: number;
  enableReservations: boolean;
  enableOnlineOrdering: boolean;
  updatedAt: string;
} | null>("/api/admin/system-settings");

const settingsForm = ref({
  enableTax: false,
  taxRate: 0,
  taxName: "PPN",
  currency: "IDR",
  timezone: "Asia/Jakarta",
  enableInventoryTracking: true,
  lowStockThreshold: 10,
  enableReservations: true,
  enableOnlineOrdering: true,
});

// Load settings when data is available
watch(
  settings,
  (newSettings) => {
    if (newSettings) {
      settingsForm.value = {
        enableTax: newSettings.enableTax,
        taxRate: newSettings.taxRate,
        taxName: newSettings.taxName,
        currency: newSettings.currency,
        timezone: newSettings.timezone,
        enableInventoryTracking: newSettings.enableInventoryTracking,
        lowStockThreshold: newSettings.lowStockThreshold,
        enableReservations: newSettings.enableReservations,
        enableOnlineOrdering: newSettings.enableOnlineOrdering,
      };
    }
  },
  { immediate: true },
);

const isSaving = ref(false);

const saveSettings = async () => {
  try {
    isSaving.value = true;

    await $fetch("/api/admin/system-settings", {
      method: "POST",
      body: settingsForm.value,
    });

    toast.add({
      title: "Success",
      description: "System settings saved successfully",
      color: "success",
    });

    await refreshSettings();
  } catch (error) {
    console.error("Failed to save settings:", error);
    toast.add({
      title: "Error",
      description: "Failed to save system settings",
      color: "error",
    });
  } finally {
    isSaving.value = false;
  }
};

const timezoneOptions = [
  { label: "WIB (Asia/Jakarta)", value: "Asia/Jakarta" },
  { label: "WITA (Asia/Makassar)", value: "Asia/Makassar" },
  { label: "WIT (Asia/Jayapura)", value: "Asia/Jayapura" },
];

const currencyOptions = [
  { label: "Indonesian Rupiah (IDR)", value: "IDR" },
  { label: "US Dollar (USD)", value: "USD" },
];
</script>

<template>
  <div>
    <div class="mb-8">
      <h1 class="text-3xl font-serif font-bold text-stone-900">
        System Settings
      </h1>
      <p class="mt-2 text-stone-600">
        Configure business operations and system behavior
      </p>
    </div>

    <div class="max-w-3xl space-y-6">
      <!-- Tax Settings -->
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold text-stone-900">Tax Settings</h3>
        </template>

        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <label class="text-sm font-medium text-stone-700">
                Enable Tax
              </label>
              <p class="text-xs text-stone-500">Add tax to all transactions</p>
            </div>
            <USwitch v-model="settingsForm.enableTax" />
          </div>

          <div v-if="settingsForm.enableTax" class="space-y-4 pt-4 border-t">
            <div>
              <label class="text-sm font-medium text-stone-700 mb-2 block">
                Tax Name
              </label>
              <UInput
                v-model="settingsForm.taxName"
                placeholder="e.g., PPN, VAT, Sales Tax"
                class="w-full mb-4"
              />
            </div>

            <div>
              <label class="text-sm font-medium text-stone-700 mb-2 block">
                Tax Rate (%)
              </label>
              <UInput
                v-model.number="settingsForm.taxRate"
                type="number"
                min="0"
                max="100"
                step="0.1"
                placeholder="e.g., 11 for 11%"
                class="w-full mb-4"
              />
              <p class="text-xs text-stone-500 mt-1">
                Current tax: {{ settingsForm.taxRate }}% ({{
                  settingsForm.taxName
                }})
              </p>
            </div>
          </div>
        </div>
      </UCard>

      <!-- Regional Settings -->
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold text-stone-900">
            Regional Settings
          </h3>
        </template>

        <div class="space-y-4">
          <div>
            <label class="text-sm font-medium text-stone-700 mb-2 block">
              Currency
            </label>
            <USelectMenu
              v-model="settingsForm.currency"
              :options="currencyOptions"
              value-key="value"
              placeholder="Select currency"
              class="w-full mb-4"
            />
          </div>

          <div>
            <label class="text-sm font-medium text-stone-700 mb-2 block">
              Timezone
            </label>
            <USelectMenu
              v-model="settingsForm.timezone"
              :options="timezoneOptions"
              value-key="value"
              placeholder="Select timezone"
              class="w-full mb-4"
            />
          </div>
        </div>
      </UCard>

      <!-- Inventory Settings -->
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold text-stone-900">
            Inventory Settings
          </h3>
        </template>

        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <label class="text-sm font-medium text-stone-700">
                Enable Inventory Tracking
              </label>
              <p class="text-xs text-stone-500">
                Track stock levels for products
              </p>
            </div>
            <USwitch v-model="settingsForm.enableInventoryTracking" />
          </div>

          <div
            v-if="settingsForm.enableInventoryTracking"
            class="pt-4 border-t"
          >
            <label class="text-sm font-medium text-stone-700 mb-2 block">
              Low Stock Threshold
            </label>
            <UInput
              v-model.number="settingsForm.lowStockThreshold"
              type="number"
              min="0"
              placeholder="e.g., 10"
              class="w-full mb-4"
            />
            <p class="text-xs text-stone-500 mt-1">
              Alert when stock falls below this number
            </p>
          </div>
        </div>
      </UCard>

      <!-- Feature Toggles -->
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold text-stone-900">Feature Toggles</h3>
        </template>

        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <label class="text-sm font-medium text-stone-700">
                Enable Reservations
              </label>
              <p class="text-xs text-stone-500">
                Allow customers to make reservations
              </p>
            </div>
            <USwitch v-model="settingsForm.enableReservations" />
          </div>

          <div class="flex items-center justify-between">
            <div>
              <label class="text-sm font-medium text-stone-700">
                Enable Online Ordering
              </label>
              <p class="text-xs text-stone-500">
                Allow customers to place orders online
              </p>
            </div>
            <USwitch v-model="settingsForm.enableOnlineOrdering" />
          </div>
        </div>
      </UCard>

      <!-- Save Button -->
      <div class="flex justify-end">
        <UButton
          :loading="isSaving"
          :disabled="isSaving"
          color="primary"
          size="lg"
          @click="saveSettings"
        >
          Save Settings
        </UButton>
      </div>
    </div>
  </div>
</template>
