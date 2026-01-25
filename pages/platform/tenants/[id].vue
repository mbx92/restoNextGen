<template>
  <div v-if="pending" class="flex items-center justify-center h-64">
    <USkeleton class="w-full h-64" />
  </div>

  <div v-else-if="tenant">
    <!-- Header -->
    <div class="mb-6">
      <div class="flex items-center gap-2 mb-2">
        <UButton
          icon="i-heroicons-arrow-left"
          variant="ghost"
          color="neutral"
          to="/platform/tenants"
        />
        <h1 class="text-2xl font-bold text-gray-900">{{ tenant.name }}</h1>
        <UBadge :color="tenant.isActive ? 'success' : 'error'" variant="subtle">
          {{ tenant.isActive ? "Active" : "Inactive" }}
        </UBadge>
      </div>
      <p class="text-gray-600 ml-10">Tenant Details & Management</p>
    </div>

    <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <!-- Main Info -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Tenant Info Card -->
        <UCard>
          <template #header>
            <h3 class="text-lg font-semibold">Tenant Information</h3>
          </template>

          <div class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="text-sm text-gray-600">Slug</label>
                <p class="font-medium">{{ tenant.slug }}</p>
              </div>
              <div>
                <label class="text-sm text-gray-600">Business Type</label>
                <p class="font-medium capitalize">{{ tenant.businessType }}</p>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="text-sm text-gray-600">Owner Name</label>
                <p class="font-medium">{{ tenant.ownerName || "-" }}</p>
              </div>
              <div>
                <label class="text-sm text-gray-600">Owner Email</label>
                <p class="font-medium">{{ tenant.ownerEmail || "-" }}</p>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="text-sm text-gray-600">Created At</label>
                <p class="font-medium">{{ formatDate(tenant.createdAt) }}</p>
              </div>
              <div>
                <label class="text-sm text-gray-600">Plan</label>
                <p class="font-medium capitalize">{{ tenant.plan }}</p>
              </div>
            </div>
          </div>
        </UCard>

        <!-- Admin Users -->
        <UCard>
          <template #header>
            <div class="flex justify-between items-center">
              <h3 class="text-lg font-semibold">Admin Users</h3>
              <UButton
                icon="i-heroicons-plus"
                label="Add Admin"
                size="sm"
                @click="showAddUserModal = true"
              />
            </div>
          </template>

          <UTable :rows="tenant.adminUsers" :columns="userColumns">
            <template #email-data="{ row }">
              <div>
                <p class="font-medium text-gray-900">
                  {{ row.original.email }}
                </p>
                <p class="text-sm text-gray-500">
                  {{ row.original.name || "No name" }}
                </p>
              </div>
            </template>

            <template #role-data="{ row }">
              <UBadge color="primary" variant="subtle">
                {{ row.original.role || "ADMIN" }}
              </UBadge>
            </template>

            <template #actions-data="{ row }">
              <UButton
                icon="i-heroicons-trash"
                variant="ghost"
                color="error"
                size="sm"
                @click="deleteUser(row.id)"
              />
            </template>
          </UTable>
        </UCard>
      </div>

      <!-- Sidebar -->
      <div class="space-y-6">
        <!-- Subscription Card -->
        <UCard v-if="tenant.subscription">
          <template #header>
            <h3 class="text-lg font-semibold">Subscription</h3>
          </template>

          <div class="space-y-4">
            <div>
              <label class="text-sm text-gray-600">Status</label>
              <div class="mt-1">
                <UBadge
                  :color="getStatusColor(tenant.subscription.status)"
                  variant="subtle"
                  size="lg"
                >
                  {{ tenant.subscription.status }}
                </UBadge>
              </div>
            </div>

            <div>
              <label class="text-sm text-gray-600">Plan</label>
              <p class="font-medium capitalize mt-1">
                {{ tenant.subscription.plan }}
              </p>
            </div>

            <div v-if="tenant.subscription.trialEndsAt">
              <label class="text-sm text-gray-600">Trial Ends</label>
              <p class="font-medium mt-1">
                {{ formatDate(tenant.subscription.trialEndsAt) }}
              </p>
            </div>

            <div v-if="tenant.subscription.currentPeriodStart">
              <label class="text-sm text-gray-600">Current Period</label>
              <p class="text-sm mt-1">
                {{ formatDate(tenant.subscription.currentPeriodStart) }} -
                {{ formatDate(tenant.subscription.currentPeriodEnd) }}
              </p>
            </div>

            <UDivider />

            <div class="space-y-2">
              <UButton block color="primary" variant="soft">
                Upgrade Plan
              </UButton>
              <UButton block color="warning" variant="soft">
                Extend Trial
              </UButton>
              <UButton block color="error" variant="soft">
                Cancel Subscription
              </UButton>
            </div>
          </div>
        </UCard>

        <!-- Actions Card -->
        <UCard>
          <template #header>
            <h3 class="text-lg font-semibold">Actions</h3>
          </template>

          <div class="space-y-2">
            <UButton
              block
              :color="tenant.isActive ? 'error' : 'success'"
              variant="soft"
              @click="toggleTenantStatus"
            >
              {{ tenant.isActive ? "Deactivate Tenant" : "Activate Tenant" }}
            </UButton>
            <UButton block color="neutral" variant="soft"> View Logs </UButton>
            <UButton block color="neutral" variant="soft">
              Reset Password
            </UButton>
          </div>
        </UCard>
      </div>
    </div>

    <!-- Add User Modal -->
    <UModal v-model="showAddUserModal">
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">Add Admin User</h3>
        </template>

        <form class="space-y-4" @submit.prevent="addUser">
          <UInput
            v-model="newUser.email"
            label="Email"
            type="email"
            required
            class="w-full mb-4"
          />
          <UInput v-model="newUser.name" label="Name" class="w-full mb-4" />
          <UInput
            v-model="newUser.password"
            label="Password"
            type="password"
            required
            class="w-full mb-4"
          />

          <div class="flex gap-2 justify-end mt-6">
            <UButton
              variant="ghost"
              color="neutral"
              @click="showAddUserModal = false"
            >
              Cancel
            </UButton>
            <UButton type="submit" color="primary">Add User</UButton>
          </div>
        </form>
      </UCard>
    </UModal>
  </div>

  <div v-else>
    <UAlert
      icon="i-heroicons-exclamation-triangle"
      color="error"
      title="Tenant not found"
    />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: "platform",
  middleware: ["platform-auth"],
});

const route = useRoute();
const tenantId = route.params.id as string;

const {
  data: tenant,
  pending,
  refresh,
} = await useFetch(`/api/platform/tenants/${tenantId}`);

const showAddUserModal = ref(false);
const newUser = ref({
  email: "",
  name: "",
  password: "",
});

const userColumns = [
  { accessorKey: "email", header: "User" },
  { accessorKey: "role", header: "Role" },
  { id: "actions", header: "" },
];

const formatDate = (date: string | null) => {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "ACTIVE":
      return "success";
    case "TRIAL":
      return "warning";
    case "PAST_DUE":
      return "warning";
    case "CANCELLED":
    case "EXPIRED":
      return "error";
    default:
      return "neutral";
  }
};

const addUser = async () => {
  try {
    await $fetch(`/api/platform/tenants/${tenantId}/users`, {
      method: "POST",
      body: newUser.value,
    });

    showAddUserModal.value = false;
    newUser.value = { email: "", name: "", password: "" };
    refresh();
  } catch (error) {
    console.error("Failed to add user:", error);
  }
};

const deleteUser = async (userId: string) => {
  if (!confirm("Are you sure you want to delete this user?")) return;

  try {
    await $fetch(`/api/platform/tenants/${tenantId}/users/${userId}`, {
      method: "DELETE",
    });
    refresh();
  } catch (error) {
    console.error("Failed to delete user:", error);
  }
};

const toggleTenantStatus = async () => {
  const action = tenant.value?.isActive ? "deactivate" : "activate";
  if (!confirm(`Are you sure you want to ${action} this tenant?`)) return;

  try {
    await $fetch(`/api/platform/tenants/${tenantId}`, {
      method: "PATCH",
      body: {
        isActive: !tenant.value?.isActive,
      },
    });
    refresh();
  } catch (error) {
    console.error("Failed to toggle tenant status:", error);
  }
};
</script>
