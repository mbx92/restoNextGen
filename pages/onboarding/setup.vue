<template>
  <div class="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50">
    <div class="container mx-auto px-4 py-16">
      <!-- Header -->
      <div class="mb-8 text-center">
        <h1 class="mb-4 text-3xl font-bold text-gray-900">
          Setup Bisnis Anda
        </h1>
        <p class="text-gray-600">
          Lengkapi informasi bisnis Anda untuk memulai
        </p>
      </div>

      <!-- Form -->
      <div class="mx-auto max-w-2xl">
        <UCard>
          <form class="space-y-6" @submit.prevent="handleSubmit">
            <!-- Business Name -->
            <div>
              <label class="mb-2 block text-sm font-medium text-gray-700">
                Nama Bisnis
              </label>
              <UInput
                v-model="form.name"
                placeholder="Warung Makan Padang"
                size="lg"
                required
                class="w-full"
              />
            </div>

            <!-- Slug -->
            <div>
              <label class="mb-2 block text-sm font-medium text-gray-700">
                URL Bisnis Anda
              </label>
              <div class="flex items-center gap-2">
                <UInput
                  v-model="form.slug"
                  placeholder="warungpadang"
                  size="lg"
                  required
                  class="flex-1"
                  @blur="checkSlug"
                />
                <span class="text-sm text-gray-500">.yourapp.com</span>
              </div>
              <p v-if="slugError" class="mt-1 text-sm text-red-600">
                {{ slugError }}
              </p>
              <p v-else-if="slugAvailable" class="mt-1 text-sm text-green-600">
                ✓ URL tersedia
              </p>
              <p class="mt-1 text-xs text-gray-500">
                Hanya huruf kecil, angka, dan tanda hubung
              </p>
            </div>

            <!-- Owner Name -->
            <div>
              <label class="mb-2 block text-sm font-medium text-gray-700">
                Nama Pemilik
              </label>
              <UInput
                v-model="form.ownerName"
                placeholder="John Doe"
                size="lg"
                required
                class="w-full"
              />
            </div>

            <!-- Owner Email -->
            <div>
              <label class="mb-2 block text-sm font-medium text-gray-700">
                Email Pemilik
              </label>
              <UInput
                v-model="form.ownerEmail"
                type="email"
                placeholder="john@example.com"
                size="lg"
                required
                class="w-full"
              />
              <p class="mt-1 text-xs text-gray-500">
                Email ini akan digunakan untuk login
              </p>
            </div>

            <!-- Password -->
            <div>
              <label class="mb-2 block text-sm font-medium text-gray-700">
                Password
              </label>
              <UInput
                v-model="form.ownerPassword"
                type="password"
                placeholder="Minimal 8 karakter"
                size="lg"
                required
                class="w-full"
              />
            </div>

            <!-- Confirm Password -->
            <div>
              <label class="mb-2 block text-sm font-medium text-gray-700">
                Konfirmasi Password
              </label>
              <UInput
                v-model="confirmPassword"
                type="password"
                placeholder="Ketik ulang password"
                size="lg"
                required
                class="w-full"
              />
              <p
                v-if="confirmPassword && confirmPassword !== form.ownerPassword"
                class="mt-1 text-sm text-red-600"
              >
                Password tidak cocok
              </p>
            </div>

            <!-- Terms -->
            <div class="flex items-start">
              <UCheckbox v-model="agreedToTerms" class="mt-1" />
              <label class="ml-2 text-sm text-gray-600">
                Saya setuju dengan
                <a href="#" class="text-green-600 hover:underline">
                  Syarat & Ketentuan
                </a>
                dan
                <a href="#" class="text-green-600 hover:underline">
                  Kebijakan Privasi
                </a>
              </label>
            </div>

            <!-- Error Message -->
            <UAlert
              v-if="errorMessage"
              color="error"
              variant="soft"
              :title="errorMessage"
            />

            <!-- Submit Button -->
            <div class="flex gap-4">
              <UButton
                type="button"
                variant="outline"
                color="neutral"
                size="lg"
                class="flex-1"
                @click="goBack"
              >
                Kembali
              </UButton>
              <UButton
                type="submit"
                color="primary"
                size="lg"
                :loading="isSubmitting"
                :disabled="!isFormValid"
                class="flex-1"
              >
                Buat Bisnis
              </UButton>
            </div>
          </form>
        </UCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: "blank",
});

const route = useRoute();
const toast = useToast();

const businessType = route.query.type as string;

if (!businessType) {
  navigateTo("/onboarding");
}

const form = ref({
  name: "",
  slug: "",
  businessType,
  ownerName: "",
  ownerEmail: "",
  ownerPassword: "",
});

const confirmPassword = ref("");
const agreedToTerms = ref(false);
const slugAvailable = ref(false);
const slugError = ref("");
const isSubmitting = ref(false);
const errorMessage = ref("");

const isFormValid = computed(() => {
  return (
    form.value.name &&
    form.value.slug &&
    form.value.ownerName &&
    form.value.ownerEmail &&
    form.value.ownerPassword.length >= 8 &&
    confirmPassword.value === form.value.ownerPassword &&
    slugAvailable.value &&
    agreedToTerms.value
  );
});

// Auto-generate slug from business name
watch(
  () => form.value.name,
  (newName) => {
    if (!form.value.slug) {
      form.value.slug = newName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
    }
  },
);

const checkSlug = async () => {
  if (!form.value.slug) return;

  try {
    const { available, suggestion } = await $fetch<{
      available: boolean;
      suggestion?: string;
    }>(`/api/onboarding/check-slug?slug=${form.value.slug}`);

    if (available) {
      slugAvailable.value = true;
      slugError.value = "";
    } else {
      slugAvailable.value = false;
      slugError.value = `URL sudah digunakan. Coba: ${suggestion}`;
    }
  } catch {
    slugError.value = "Gagal memeriksa ketersediaan URL";
  }
};

const handleSubmit = async () => {
  if (!isFormValid.value) return;

  isSubmitting.value = true;
  errorMessage.value = "";

  try {
    const response = await $fetch<{ success: boolean; tenant: { slug: string } }>(
      "/api/onboarding/signup",
      {
        method: "POST",
        body: form.value,
      },
    );

    if (response.success) {
      toast.add({
        title: "Berhasil!",
        description: "Bisnis Anda telah dibuat",
        color: "success",
      });

      navigateTo(`/onboarding/complete?slug=${response.tenant.slug}`);
    }
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : "Gagal membuat bisnis";
  } finally {
    isSubmitting.value = false;
  }
};

const goBack = () => {
  navigateTo("/onboarding");
};
</script>
