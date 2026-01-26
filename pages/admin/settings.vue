<script setup lang="ts">
definePageMeta({
  layout: "admin",
  middleware: ["admin-auth"],
});

const { data: headerSettings, refresh: refreshHeader } = await useFetch(
  "/api/admin/site-settings/header",
);
const { data: footerSettings, refresh: refreshFooter } = await useFetch(
  "/api/admin/site-settings/footer",
);

// Header Form
const headerForm = ref({
  logoText: "",
  logoUrl: "",
  facebookUrl: "",
  instagramUrl: "",
  twitterUrl: "",
});

// Footer Form
const footerForm = ref({
  copyrightText: "",
  footerLinks: [] as { label: string; url: string }[],
});

const isSavingHeader = ref(false);
const isSavingFooter = ref(false);

// Initialize toast at top-level
const toast = useToast();

// Load header settings
watch(
  headerSettings,
  (settings) => {
    if (settings) {
      headerForm.value = {
        logoText: settings.logoText || "",
        logoUrl: settings.logoUrl || "",
        facebookUrl: settings.facebookUrl || "",
        instagramUrl: settings.instagramUrl || "",
        twitterUrl: settings.twitterUrl || "",
      };
    }
  },
  { immediate: true },
);

// Load footer settings
watch(
  footerSettings,
  (settings) => {
    if (settings) {
      footerForm.value = {
        copyrightText: settings.copyrightText || "",
        footerLinks:
          (settings.footerLinks as { label: string; url: string }[]) || [],
      };
    }
  },
  { immediate: true },
);

const saveHeader = async () => {
  try {
    isSavingHeader.value = true;
    await $fetch("/api/admin/site-settings/header", {
      method: "POST",
      body: headerForm.value,
    });
    await refreshHeader();

    toast.add({
      title: "Success",
      description: "Header settings updated",
      color: "success",
    });
  } catch (error) {
    console.error("Failed to save header:", error);
    toast.add({
      title: "Error",
      description: "Failed to update header settings",
      color: "error",
    });
  } finally {
    isSavingHeader.value = false;
  }
};

const saveFooter = async () => {
  try {
    isSavingFooter.value = true;
    await $fetch("/api/admin/site-settings/footer", {
      method: "POST",
      body: footerForm.value,
    });
    await refreshFooter();

    toast.add({
      title: "Success",
      description: "Footer settings updated",
      color: "success",
    });
  } catch (error) {
    console.error("Failed to save footer:", error);
    toast.add({
      title: "Error",
      description: "Failed to update footer settings",
      color: "error",
    });
  } finally {
    isSavingFooter.value = false;
  }
};

const addFooterLink = () => {
  footerForm.value.footerLinks.push({ label: "", url: "" });
};

const removeFooterLink = (index: number) => {
  footerForm.value.footerLinks.splice(index, 1);
};
</script>

<template>
  <div>
    <div class="mb-8">
      <h1 class="text-3xl font-serif font-bold text-stone-900">
        Site Settings
      </h1>
      <p class="mt-2 text-stone-600">Manage header and footer content</p>
    </div>

    <div class="space-y-6">
      <!-- Header Settings -->
      <UCard>
        <template #header>
          <h2 class="text-xl font-semibold text-stone-900">Header Settings</h2>
        </template>

        <form class="space-y-5" @submit.prevent="saveHeader">
          <UFormField label="Logo Text">
            <UInput
              v-model="headerForm.logoText"
              placeholder="wrPadi"
              class="w-full mb-4"
            />
            <template #help>
              <span class="text-xs text-stone-400">
                Text displayed in the header logo
              </span>
            </template>
          </UFormField>

          <UFormField label="Logo Image URL">
            <UInput
              v-model="headerForm.logoUrl"
              placeholder="https://example.com/logo.png"
              class="w-full mb-4"
            />
            <template #help>
              <span class="text-xs text-stone-400">
                Optional: Will be used instead of text if provided
              </span>
            </template>
          </UFormField>

          <div class="border-t border-stone-200 pt-4">
            <h3 class="mb-4 font-semibold text-stone-700">
              Social Media Links
            </h3>

            <div class="space-y-4">
              <UFormField label="Facebook URL">
                <UInput
                  v-model="headerForm.facebookUrl"
                  placeholder="https://facebook.com/wrpadi"
                  class="w-full mb-4"
                />
              </UFormField>

              <UFormField label="Instagram URL">
                <UInput
                  v-model="headerForm.instagramUrl"
                  placeholder="https://instagram.com/wrpadi"
                  class="w-full mb-4"
                />
              </UFormField>

              <UFormField label="Twitter URL">
                <UInput
                  v-model="headerForm.twitterUrl"
                  placeholder="https://twitter.com/wrpadi"
                  class="w-full"
                />
              </UFormField>
            </div>
          </div>

          <div class="flex justify-end">
            <UButton
              type="submit"
              color="primary"
              size="lg"
              :loading="isSavingHeader"
            >
              Save Header Settings
            </UButton>
          </div>
        </form>
      </UCard>

      <!-- Footer Settings -->
      <UCard>
        <template #header>
          <h2 class="text-xl font-semibold text-stone-900">Footer Settings</h2>
        </template>

        <form class="space-y-5" @submit.prevent="saveFooter">
          <UFormField label="Copyright Text">
            <UInput
              v-model="footerForm.copyrightText"
              placeholder="© 2026 wrPadi. All rights reserved."
              class="w-full"
            />
          </UFormField>

          <div class="border-t border-stone-200 pt-4">
            <div class="mb-4 flex items-center justify-between">
              <h3 class="font-semibold text-stone-700">Footer Links</h3>
              <UButton
                type="button"
                variant="outline"
                size="sm"
                icon="i-heroicons-plus"
                @click="addFooterLink"
              >
                Add Link
              </UButton>
            </div>

            <div class="space-y-3">
              <div
                v-for="(link, index) in footerForm.footerLinks"
                :key="index"
                class="flex gap-3"
              >
                <UInput
                  v-model="link.label"
                  placeholder="Label (e.g., Privacy Policy)"
                  class="flex-1"
                />
                <UInput
                  v-model="link.url"
                  placeholder="URL (e.g., /privacy)"
                  class="flex-1"
                />
                <UButton
                  type="button"
                  variant="ghost"
                  color="error"
                  icon="i-heroicons-trash"
                  size="md"
                  @click="removeFooterLink(index)"
                />
              </div>

              <div
                v-if="footerForm.footerLinks.length === 0"
                class="py-8 text-center text-sm text-stone-500"
              >
                No footer links yet. Click "Add Link" to create one.
              </div>
            </div>
          </div>

          <div class="flex justify-end">
            <UButton
              type="submit"
              color="primary"
              size="lg"
              :loading="isSavingFooter"
            >
              Save Footer Settings
            </UButton>
          </div>
        </form>
      </UCard>
    </div>
  </div>
</template>
