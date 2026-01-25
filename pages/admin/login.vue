<script setup lang="ts">
definePageMeta({
  layout: "blank",
});

const email = ref("");
const password = ref("");
const loading = ref(false);
const error = ref("");
const isDev = import.meta.dev;

const router = useRouter();

function fillCredentials() {
  email.value = "admin@wrpadi.com";
  password.value = "admin123";
}

async function handleLogin() {
  loading.value = true;
  error.value = "";

  try {
    const { error: apiError } = await useFetch("/api/admin/auth/login", {
      method: "POST",
      body: {
        email: email.value,
        password: password.value,
      },
    });

    if (apiError.value) {
      error.value = apiError.value.statusMessage || "Login failed";
      return;
    }

    // Redirect to admin dashboard
    await router.push("/admin");
  } catch (e: unknown) {
    const err = e as { message?: string };
    error.value = err.message || "An error occurred";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-stone-100">
    <div class="w-full max-w-md px-4">
      <UCard>
        <template #header>
          <div class="text-center">
            <h1 class="text-2xl font-bold font-serif text-stone-900">
              Admin <span class="text-primary-600">Login</span>
            </h1>
            <p class="mt-2 text-sm text-stone-600">
              Sign in to access admin panel
            </p>
          </div>
        </template>

        <form class="space-y-4" @submit.prevent="handleLogin">
          <UFormField label="Email" required>
            <UInput
              v-model="email"
              type="email"
              placeholder="admin@wrpadi.com"
              required
              :disabled="loading"
              icon="i-heroicons-envelope"
              class="w-full"
            />
          </UFormField>

          <UFormField label="Password" required>
            <UInput
              v-model="password"
              type="password"
              placeholder="Enter your password"
              required
              :disabled="loading"
              icon="i-heroicons-lock-closed"
              class="w-full"
            />
          </UFormField>

          <div
            v-if="error"
            class="rounded-md bg-red-50 p-3 text-sm text-red-700"
          >
            {{ error }}
          </div>

          <UButton
            v-if="isDev"
            type="button"
            color="neutral"
            variant="outline"
            block
            label="Fill Dev Credentials"
            class="mb-2"
            @click="fillCredentials"
          />

          <UButton
            type="submit"
            :loading="loading"
            block
            size="xl"
            color="primary"
            label="Sign In"
          />
        </form>

        <template #footer>
          <div class="text-center text-sm text-stone-500">
            Default credentials: admin@wrpadi.com / admin123
          </div>
        </template>
      </UCard>
    </div>
  </div>
</template>
