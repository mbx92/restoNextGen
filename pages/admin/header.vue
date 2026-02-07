<script setup lang="ts">
const { requireFeature } = useFeatures();

definePageMeta({
  layout: "admin",
  middleware: ["admin-auth"],
});

// Check if CMS feature is enabled
if (
  !requireFeature("CONTENT_MANAGEMENT_SERVICE", "Content Management Service")
) {
  // requireFeature will show toast and navigate to settings if feature is not available
}

const toast = useToast();
const isSaving = ref(false);

// Load current header settings
const { data: headerSettings, refresh } = await useFetch(
  "/api/admin/site-settings/header",
);

const form = ref({
  logoText: "",
  logoUrl: "",
  facebookUrl: "",
  instagramUrl: "",
  twitterUrl: "",
});

// Populate form with existing data
if (headerSettings.value) {
  form.value = {
    logoText: headerSettings.value.logoText || "",
    logoUrl: headerSettings.value.logoUrl || "",
    facebookUrl: headerSettings.value.facebookUrl || "",
    instagramUrl: headerSettings.value.instagramUrl || "",
    twitterUrl: headerSettings.value.twitterUrl || "",
  };
}

const saveSettings = async () => {
  isSaving.value = true;

  try {
    await $fetch("/api/admin/site-settings/header", {
      method: "POST",
      body: form.value,
    });

    toast.add({
      title: "Berhasil",
      description:
        "Header settings berhasil disimpan. Refresh landing page untuk melihat perubahan.",
      color: "success",
    });

    await refresh();
  } catch (error) {
    toast.add({
      title: "Error",
      description:
        error instanceof Error ? error.message : "Gagal menyimpan settings",
      color: "error",
    });
  } finally {
    isSaving.value = false;
  }
};
</script>

<template>
  <div>
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Header Settings</h1>
      <p class="text-gray-600">Customize header website Anda</p>
    </div>

    <UCard>
      <form class="space-y-6" @submit.prevent="saveSettings">
        <!-- Logo Text -->
        <div>
          <label class="mb-2 block text-sm font-medium text-gray-700">
            Logo Text
          </label>
          <UInput
            v-model="form.logoText"
            placeholder="Nama Bisnis Anda"
            class="w-full mb-4"
          />
          <p class="text-xs text-gray-500">
            Text yang muncul di header jika tidak ada logo gambar
          </p>
        </div>

        <!-- Logo URL -->
        <div>
          <label class="mb-2 block text-sm font-medium text-gray-700">
            Logo URL (Optional)
          </label>
          <UInput
            v-model="form.logoUrl"
            placeholder="https://example.com/logo.png"
            class="w-full mb-4"
          />
          <p class="text-xs text-gray-500">
            URL gambar logo. Jika diisi, akan menggantikan logo text
          </p>
        </div>

        <div class="border-t pt-6">
          <h3 class="mb-4 text-lg font-semibold text-gray-900">
            Social Media Links
          </h3>

          <!-- Facebook -->
          <div class="mb-4">
            <label class="mb-2 block text-sm font-medium text-gray-700">
              Facebook URL
            </label>
            <UInput
              v-model="form.facebookUrl"
              placeholder="https://facebook.com/yourpage"
              class="w-full mb-4"
            />
          </div>

          <!-- Instagram -->
          <div class="mb-4">
            <label class="mb-2 block text-sm font-medium text-gray-700">
              Instagram URL
            </label>
            <UInput
              v-model="form.instagramUrl"
              placeholder="https://instagram.com/yourpage"
              class="w-full mb-4"
            />
          </div>

          <!-- Twitter -->
          <div class="mb-4">
            <label class="mb-2 block text-sm font-medium text-gray-700">
              Twitter URL
            </label>
            <UInput
              v-model="form.twitterUrl"
              placeholder="https://twitter.com/yourpage"
              class="w-full mb-4"
            />
          </div>
        </div>

        <!-- Actions -->
        <div class="flex gap-2 pt-4 border-t">
          <UButton
            type="submit"
            color="primary"
            :loading="isSaving"
            class="flex-1"
          >
            Save Changes
          </UButton>
        </div>
      </form>
    </UCard>

    <!-- Preview -->
    <UCard class="mt-6">
      <template #header>
        <h3 class="text-lg font-semibold">Preview</h3>
      </template>

      <div class="rounded-lg border border-gray-200 bg-white p-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <img
              v-if="form.logoUrl"
              :src="form.logoUrl"
              :alt="form.logoText"
              class="h-8 w-auto"
            />
            <span
              v-else
              class="text-xl font-serif font-bold tracking-tight text-stone-900"
            >
              {{ form.logoText || "Logo Text" }}
            </span>
          </div>

          <div class="flex items-center gap-4">
            <span class="text-sm text-gray-600">Menu Items</span>
            <div
              v-if="form.facebookUrl || form.instagramUrl || form.twitterUrl"
              class="flex gap-2"
            >
              <div
                v-if="form.facebookUrl"
                class="h-8 w-8 rounded-full bg-gray-100"
              />
              <div
                v-if="form.instagramUrl"
                class="h-8 w-8 rounded-full bg-gray-100"
              />
              <div
                v-if="form.twitterUrl"
                class="h-8 w-8 rounded-full bg-gray-100"
              />
            </div>
          </div>
        </div>
      </div>
    </UCard>
  </div>
</template>
