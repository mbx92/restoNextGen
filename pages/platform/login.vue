<template>
  <div class="flex items-center justify-center min-h-screen bg-gray-50">
    <UCard class="w-full max-w-md">
      <template #header>
        <div class="text-center">
          <h1 class="text-2xl font-bold text-gray-900">Platform Admin</h1>
          <p class="mt-2 text-sm text-gray-600">
            Sign in to manage tenants and subscriptions
          </p>
        </div>
      </template>

      <form class="space-y-4" @submit.prevent="handleLogin">
        <UFormGroup label="Email" required>
          <UInput
            v-model="form.email"
            type="email"
            placeholder="superadmin@wrpadi.com"
            size="lg"
            :disabled="isLoading"
            class="w-full mb-4"
          />
        </UFormGroup>

        <UFormGroup label="Password" required>
          <UInput
            v-model="form.password"
            type="password"
            placeholder="Enter your password"
            size="lg"
            :disabled="isLoading"
            class="w-full mb-4"
          />
        </UFormGroup>

        <UButton
          type="submit"
          block
          size="lg"
          :loading="isLoading"
          :disabled="!form.email || !form.password"
        >
          Sign In
        </UButton>

        <UButton
          v-if="isDev"
          block
          variant="outline"
          color="neutral"
          size="sm"
          class="mt-2"
          @click="fillCredentials"
        >
          Fill Demo Credentials
        </UButton>
      </form>

      <template #footer>
        <div class="text-center">
          <p class="text-sm text-gray-600">
            Tenant admin?
            <NuxtLink
              to="/admin/login"
              class="text-primary-600 hover:text-primary-700"
            >
              Sign in here
            </NuxtLink>
          </p>
        </div>
      </template>
    </UCard>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: "blank",
});

const form = ref({
  email: "",
  password: "",
});

const isLoading = ref(false);
const toast = useToast();
const isDev = import.meta.dev;

const fillCredentials = () => {
  form.value.email = "superadmin@wrpadi.com";
  form.value.password = "superadmin123";
  toast.add({
    title: "Demo credentials filled",
    description: "Click Sign In to continue",
    color: "primary",
  });
};

const handleLogin = async () => {
  isLoading.value = true;

  try {
    await $fetch("/api/platform/auth/login", {
      method: "POST",
      body: form.value,
    });

    toast.add({
      title: "Success",
      description: "Logged in successfully",
      color: "success",
    });

    await navigateTo("/platform");
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Login gagal. Silakan coba lagi.";
    toast.add({
      title: "Error",
      description: errorMessage,
      color: "error",
    });
  } finally {
    isLoading.value = false;
  }
};
</script>
