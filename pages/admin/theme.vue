<template>
  <div>
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Theme Customization</h1>
      <p class="text-gray-600">Customize tampilan website Anda</p>

      <!-- Info Alert -->
      <div class="mt-4 rounded-lg bg-blue-50 border border-blue-200 p-4">
        <div class="flex items-start gap-3">
          <svg
            class="h-5 w-5 text-blue-600 mt-0.5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clip-rule="evenodd"
            />
          </svg>
          <div class="text-sm">
            <p class="font-medium text-blue-900">Cara menggunakan:</p>
            <ol class="mt-2 text-blue-800 list-decimal list-inside space-y-1">
              <li>Pilih preset atau edit warna manual</li>
              <li><strong>Klik "Save Changes"</strong> untuk menyimpan</li>
              <li>
                Buka <strong>/t/{{ tenantSlug }}</strong> untuk lihat perubahan
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>

    <!-- Theme Presets Section -->
    <UCard class="mb-6">
      <template #header>
        <h3 class="text-lg font-semibold">Theme Presets</h3>
        <p class="text-sm text-gray-600">
          Pilih tema siap pakai sesuai dengan bisnis Anda
        </p>
      </template>

      <div
        v-if="!themePresets || themePresets.length === 0"
        class="p-4 text-center text-gray-500"
      >
        <p>Loading theme presets...</p>
      </div>

      <div v-else class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <button
          v-for="preset in themePresets"
          :key="preset.id"
          type="button"
          class="group relative overflow-hidden rounded-lg border-2 p-4 text-left transition hover:shadow-lg"
          :class="
            isCurrentPreset(preset)
              ? 'border-primary-500 bg-primary-50'
              : 'border-gray-200 hover:border-primary-300'
          "
          @click="applyPreset(preset)"
        >
          <!-- Checkmark if active -->
          <div
            v-if="isCurrentPreset(preset)"
            class="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary-500 text-white"
          >
            <svg
              class="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <!-- Color preview -->
          <div class="mb-3 flex gap-2">
            <div
              class="h-10 w-10 rounded border border-gray-300"
              :style="{ backgroundColor: preset.primaryColor }"
            />
            <div
              class="h-10 w-10 rounded border border-gray-300"
              :style="{ backgroundColor: preset.secondaryColor }"
            />
          </div>

          <!-- Preset info -->
          <h4 class="mb-1 font-semibold text-gray-900">{{ preset.name }}</h4>
          <p class="text-sm text-gray-600">{{ preset.description }}</p>

          <!-- Font info -->
          <div class="mt-2 text-xs text-gray-500">
            Font: {{ preset.fontFamily }}
          </div>
        </button>
      </div>
    </UCard>

    <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <!-- Theme Editor -->
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">Custom Theme Settings</h3>
          <p class="text-sm text-gray-600">Atau sesuaikan tema secara manual</p>
        </template>

        <form class="space-y-6" @submit.prevent="saveTheme">
          <!-- Primary Color -->
          <div>
            <label class="mb-2 block text-sm font-medium text-gray-700">
              Primary Color
            </label>
            <div class="flex gap-2">
              <input
                v-model="form.primaryColor"
                type="color"
                class="h-10 w-20 cursor-pointer rounded border"
              />
              <UInput
                v-model="form.primaryColor"
                placeholder="#16a34a"
                class="flex-1"
              />
            </div>
          </div>

          <!-- Secondary Color -->
          <div>
            <label class="mb-2 block text-sm font-medium text-gray-700">
              Secondary Color
            </label>
            <div class="flex gap-2">
              <input
                v-model="form.secondaryColor"
                type="color"
                class="h-10 w-20 cursor-pointer rounded border"
              />
              <UInput
                v-model="form.secondaryColor"
                placeholder="#ca8a04"
                class="flex-1"
              />
            </div>
          </div>

          <!-- Font Family -->
          <div>
            <label class="mb-2 block text-sm font-medium text-gray-700">
              Font Family
            </label>
            <USelectMenu
              v-model="form.fontFamily"
              :options="fontOptions"
              class="w-full"
            />
          </div>

          <!-- Layout Variant -->
          <div>
            <label class="mb-2 block text-sm font-medium text-gray-700">
              Layout Variant
            </label>
            <USelectMenu
              v-model="form.layoutVariant"
              :options="layoutOptions"
              class="w-full"
            />
          </div>

          <!-- Custom CSS -->
          <div>
            <label class="mb-2 block text-sm font-medium text-gray-700">
              Custom CSS (Advanced)
            </label>
            <UTextarea
              v-model="form.customCss"
              placeholder="/* Your custom CSS here */"
              :rows="6"
              class="w-full font-mono text-sm"
            />
          </div>

          <!-- Actions -->
          <div class="flex gap-2">
            <UButton
              type="submit"
              color="primary"
              :loading="isSaving"
              class="flex-1"
            >
              Save Changes
            </UButton>
            <UButton
              type="button"
              variant="outline"
              color="neutral"
              @click="resetToDefault"
            >
              Reset to Default
            </UButton>
          </div>
        </form>
      </UCard>

      <!-- Preview -->
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">Preview</h3>
        </template>

        <div class="space-y-4">
          <p class="text-sm text-gray-600">
            Preview tampilan dengan tema yang Anda pilih:
          </p>

          <!-- Color Preview -->
          <div class="space-y-2">
            <div class="flex items-center gap-2">
              <div
                class="h-10 w-10 rounded"
                :style="{ backgroundColor: form.primaryColor }"
              />
              <span class="text-sm text-gray-600">Primary Color</span>
            </div>
            <div class="flex items-center gap-2">
              <div
                class="h-10 w-10 rounded"
                :style="{ backgroundColor: form.secondaryColor }"
              />
              <span class="text-sm text-gray-600">Secondary Color</span>
            </div>
          </div>

          <!-- Button Preview -->
          <div class="space-y-2">
            <p class="text-sm font-medium text-gray-700">Buttons:</p>
            <div class="flex flex-wrap gap-2">
              <button
                type="button"
                class="rounded px-4 py-2 text-white"
                :style="{ backgroundColor: form.primaryColor }"
              >
                Primary Button
              </button>
              <button
                type="button"
                class="rounded px-4 py-2 text-white"
                :style="{ backgroundColor: form.secondaryColor }"
              >
                Secondary Button
              </button>
            </div>
          </div>

          <!-- Font Preview -->
          <div class="space-y-2">
            <p class="text-sm font-medium text-gray-700">Font Preview:</p>
            <div
              class="rounded border p-4"
              :style="{ fontFamily: form.fontFamily }"
            >
              <p class="text-2xl font-bold">The Quick Brown Fox</p>
              <p class="text-gray-600">Jumps over the lazy dog. 1234567890</p>
            </div>
          </div>
        </div>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ThemePreset } from "~/server/config/theme-presets";

definePageMeta({
  layout: "admin",
  middleware: ["admin-auth"],
});

const toast = useToast();

const fontOptions = [
  "Inter",
  "Poppins",
  "Lora",
  "Playfair Display",
  "Montserrat",
];
const layoutOptions = ["default", "minimal", "bold"];

const form = ref({
  primaryColor: "#16a34a",
  secondaryColor: "#ca8a04",
  fontFamily: "Inter",
  layoutVariant: "default",
  customCss: "",
});

const isSaving = ref(false);

// Load theme presets
const { data: themePresets, error: presetsError } = await useFetch<
  ThemePreset[]
>("/api/admin/theme/presets");

// Debug: Log presets data
console.log("Theme Presets:", themePresets.value);
console.log("Presets Error:", presetsError.value);

// Load current theme
const { data: currentTheme } = await useFetch("/api/admin/theme");

// Get tenant slug from session for display
const { data: session } = await useFetch("/api/auth/session");
const tenantSlug = computed(
  () => session.value?.user?.tenantSlug || "demo-restaurant",
);

if (currentTheme.value) {
  form.value = {
    primaryColor: currentTheme.value.primaryColor,
    secondaryColor: currentTheme.value.secondaryColor,
    fontFamily: currentTheme.value.fontFamily || "Inter",
    layoutVariant: currentTheme.value.layoutVariant || "default",
    customCss: currentTheme.value.customCss || "",
  };
}

const isCurrentPreset = (preset: ThemePreset) => {
  return (
    form.value.primaryColor === preset.primaryColor &&
    form.value.secondaryColor === preset.secondaryColor &&
    form.value.fontFamily === preset.fontFamily &&
    form.value.layoutVariant === preset.layoutVariant
  );
};

const applyPreset = (preset: ThemePreset) => {
  form.value.primaryColor = preset.primaryColor;
  form.value.secondaryColor = preset.secondaryColor;
  form.value.fontFamily = preset.fontFamily;
  form.value.layoutVariant = preset.layoutVariant;

  toast.add({
    title: "Preset Terpilih",
    description: `${preset.name} dipilih. Klik "Save Changes" di bawah untuk menyimpan!`,
    color: "info",
    timeout: 5000,
  });
};

const saveTheme = async () => {
  isSaving.value = true;

  try {
    await $fetch("/api/admin/theme", {
      method: "POST",
      body: form.value,
    });

    toast.add({
      title: "Tema Tersimpan!",
      description:
        "Buka halaman landing page tenant Anda untuk melihat perubahan.",
      color: "success",
      timeout: 8000,
    });

    // Reload page to apply theme in admin panel
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  } catch (error) {
    toast.add({
      title: "Error",
      description:
        error instanceof Error ? error.message : "Failed to save theme",
      color: "error",
    });
  } finally {
    isSaving.value = false;
  }
};

const resetToDefault = () => {
  form.value = {
    primaryColor: "#16a34a",
    secondaryColor: "#ca8a04",
    fontFamily: "Inter",
    layoutVariant: "default",
    customCss: "",
  };
};
</script>
