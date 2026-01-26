<script setup lang="ts">
import type { UserRole } from "@prisma/client";

definePageMeta({
  layout: "blank",
});

interface LoginResponse {
  success: boolean;
  user: {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    tenantId: string | null;
    tenantSlug?: string;
    businessType?: string;
  };
}

const router = useRouter();
const toast = useToast();
const loading = ref(false);

const form = ref({
  email: "",
  password: "",
  tenantSlug: "", // Will be auto-detected or use default
});

// Pre-fill for testing
const quickLogin = (email: string, password: string) => {
  form.value.email = email;
  form.value.password = password;
};

async function handleLogin() {
  loading.value = true;
  try {
    const response = await $fetch<LoginResponse>("/api/auth/login", {
      method: "POST",
      body: form.value,
    });

    toast.add({
      title: "Login successful",
      description: `Welcome back, ${response.user.name}!`,
      color: "success",
    });

    // Redirect based on role
    if (
      response.user.role === "OWNER" ||
      response.user.role === "MANAGER" ||
      response.user.role === "CASHIER" ||
      response.user.role === "WAITER" ||
      response.user.role === "KITCHEN"
    ) {
      await router.push("/admin");
    } else {
      // Customers redirect to home
      await router.push("/");
    }
  } catch (error: any) {
    toast.add({
      title: "Login failed",
      description: error.data?.message || "Invalid email or password",
      color: "error",
    });
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-gray-900 dark:to-gray-800 p-4"
  >
    <UCard class="w-full max-w-md">
      <template #header>
        <div class="text-center">
          <h1 class="text-2xl font-bold">Staff & Customer Login</h1>
          <p class="text-gray-600 dark:text-gray-400 text-sm mt-1">
            Sign in to access your account
          </p>
        </div>
      </template>

      <form @submit.prevent="handleLogin" class="space-y-4">
        <UInput
          v-model="form.email"
          type="email"
          label="Email"
          placeholder="your@email.com"
          required
          class="w-full mb-4"
          icon="i-heroicons-envelope"
        />

        <UInput
          v-model="form.password"
          type="password"
          label="Password"
          placeholder="Enter your password"
          required
          class="w-full mb-4"
          icon="i-heroicons-lock-closed"
        />

        <UButton
          type="submit"
          color="primary"
          block
          size="lg"
          :loading="loading"
          class="w-full"
        >
          Sign In
        </UButton>
      </form>

      <template #footer>
        <div class="space-y-3">
          <div class="text-center text-sm text-gray-600 dark:text-gray-400">
            Quick Login (Demo)
          </div>

          <div class="grid grid-cols-2 gap-2">
            <UButton
              color="neutral"
              variant="soft"
              size="xs"
              @click="quickLogin('owner@wrpadi.com', 'owner123')"
            >
              👑 Owner
            </UButton>
            <UButton
              color="neutral"
              variant="soft"
              size="xs"
              @click="quickLogin('manager@wrpadi.com', 'manager123')"
            >
              👔 Manager
            </UButton>
            <UButton
              color="neutral"
              variant="soft"
              size="xs"
              @click="quickLogin('cashier@wrpadi.com', 'cashier123')"
            >
              💰 Cashier
            </UButton>
            <UButton
              color="neutral"
              variant="soft"
              size="xs"
              @click="quickLogin('waiter@wrpadi.com', 'waiter123')"
            >
              🍽️ Waiter
            </UButton>
            <UButton
              color="neutral"
              variant="soft"
              size="xs"
              @click="quickLogin('kitchen@wrpadi.com', 'kitchen123')"
            >
              👨‍🍳 Kitchen
            </UButton>
            <UButton
              color="neutral"
              variant="soft"
              size="xs"
              @click="quickLogin('customer@wrpadi.com', 'customer123')"
            >
              🧑 Customer
            </UButton>
          </div>

          <div class="text-center pt-2 text-xs text-gray-500">
            All users login here (Staff & Customer)
          </div>
        </div>
      </template>
    </UCard>
  </div>
</template>
