<template>
  <div>
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Theme Customization</h1>
      <p class="text-gray-600">Customize tampilan website Anda</p>
    </div>

    <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <!-- Theme Editor -->
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">Theme Settings</h3>
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
definePageMeta({
  layout: "admin",
  middleware: ["admin-auth"],
});

const toast = useToast();

const fontOptions = ["Inter", "Poppins", "Roboto", "Open Sans", "Lato"];
const layoutOptions = ["default", "minimal", "bold"];

const form = ref({
  primaryColor: "#16a34a",
  secondaryColor: "#ca8a04",
  fontFamily: "Inter",
  layoutVariant: "default",
  customCss: "",
});

const isSaving = ref(false);

// Load current theme
const { data: currentTheme } = await useFetch("/api/admin/theme");

if (currentTheme.value) {
  form.value = {
    primaryColor: currentTheme.value.primaryColor,
    secondaryColor: currentTheme.value.secondaryColor,
    fontFamily: currentTheme.value.fontFamily || "Inter",
    layoutVariant: currentTheme.value.layoutVariant || "default",
    customCss: currentTheme.value.customCss || "",
  };
}

const saveTheme = async () => {
  isSaving.value = true;

  try {
    await $fetch("/api/admin/theme", {
      method: "POST",
      body: form.value,
    });

    toast.add({
      title: "Success",
      description: "Theme saved successfully. Refresh to see changes.",
      color: "success",
    });

    // Reload page to apply theme
    setTimeout(() => {
      window.location.reload();
    }, 1000);
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
