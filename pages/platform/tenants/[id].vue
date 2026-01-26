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
                <ClientOnly>
                  <p class="font-medium">{{ formatDate(tenant.createdAt) }}</p>
                  <template #fallback>
                    <p class="font-medium text-gray-400">Loading...</p>
                  </template>
                </ClientOnly>
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

          <ClientOnly>
            <UTable :data="tenant.adminUsers" :columns="userColumns">
              <template #email-cell="{ row }">
                <div>
                  <p class="font-medium text-gray-900">
                    {{ row.original.email }}
                  </p>
                  <p class="text-sm text-gray-500">
                    {{ row.original.name || "No name" }}
                  </p>
                </div>
              </template>

              <template #role-cell="{ row }">
                <UBadge color="primary" variant="subtle">
                  {{ row.original.role || "ADMIN" }}
                </UBadge>
              </template>

              <template #actions-cell="{ row }">
                <UButton
                  icon="i-heroicons-trash"
                  variant="ghost"
                  color="error"
                  size="sm"
                  @click="deleteUser(row.original.id)"
                />
              </template>
            </UTable>
            <template #fallback>
              <div class="p-4 text-center text-gray-500">Loading...</div>
            </template>
          </ClientOnly>
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

            <hr class="my-4 border-gray-200" />

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
              icon="i-heroicons-shield-check"
              color="primary"
              variant="soft"
              @click="showPermissionsModal = true"
            >
              View Permissions
            </UButton>
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
  </div>

  <div v-else>
    <UAlert
      icon="i-heroicons-exclamation-triangle"
      color="error"
      title="Tenant not found"
    />
  </div>

  <!-- Add User Modal -->
  <UModal
    v-model:open="showAddUserModal"
    title="Add Admin User"
    description="Add a new administrator to this tenant"
  >
    <template #body>
      <form class="space-y-4" @submit.prevent="addUser">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1"
            >Email *</label
          >
          <UInput
            v-model="newUser.email"
            type="email"
            required
            placeholder="user@example.com"
            class="w-full"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1"
            >Name</label
          >
          <UInput
            v-model="newUser.name"
            placeholder="Full name"
            class="w-full"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1"
            >Password *</label
          >
          <UInput
            v-model="newUser.password"
            type="password"
            required
            placeholder="Min 8 characters"
            class="w-full"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1"
            >Role</label
          >
          <USelectMenu
            v-model="newUser.role"
            :items="roleOptions"
            value-key="value"
            placeholder="Select role"
            class="w-full"
          />
        </div>

        <UAlert
          v-if="userError"
          color="error"
          icon="i-heroicons-exclamation-triangle"
          :title="userError"
        />
      </form>
    </template>

    <template #footer="{ close }">
      <div class="flex gap-2 justify-end">
        <UButton variant="ghost" color="neutral" @click="close">
          Cancel
        </UButton>
        <UButton color="primary" :loading="addingUser" @click="addUser">
          Add User
        </UButton>
      </div>
    </template>
  </UModal>

  <!-- Permissions Modal -->
  <UModal
    v-model:open="showPermissionsModal"
    title="RBAC Permissions"
    :description="tenant ? `${tenant.name} - ${tenant.businessType}` : ''"
    :ui="{ width: 'max-w-4xl' }"
  >
    <template #body>
      <div v-if="loadingPermissions" class="p-8 text-center">
        <UIcon
          name="i-heroicons-arrow-path"
          class="w-6 h-6 animate-spin mx-auto mb-2"
        />
        <p class="text-gray-500">Loading permissions...</p>
      </div>

      <div v-else-if="permissionsData" class="space-y-6">
        <!-- Summary -->
        <div class="grid grid-cols-4 gap-4">
          <div class="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p class="text-2xl font-bold text-primary-600">
              {{ permissionsData.summary.enabledPermissions }}
            </p>
            <p class="text-xs text-gray-500">Enabled</p>
          </div>
          <div class="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p class="text-2xl font-bold text-gray-600">
              {{ permissionsData.summary.totalPermissions }}
            </p>
            <p class="text-xs text-gray-500">Total</p>
          </div>
          <div class="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p class="text-2xl font-bold text-warning-600">
              {{ permissionsData.summary.overriddenPermissions }}
            </p>
            <p class="text-xs text-gray-500">Overridden</p>
          </div>
          <div class="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p class="text-2xl font-bold text-info-600">
              {{ permissionsData.summary.availableRoles }}
            </p>
            <p class="text-xs text-gray-500">Roles</p>
          </div>
        </div>

        <!-- Roles -->
        <div>
          <h4 class="font-semibold text-sm mb-3">Available Roles</h4>
          <div class="flex flex-wrap gap-2">
            <UBadge
              v-for="role in permissionsData.roles"
              :key="role.id"
              :color="
                role.code === 'OWNER'
                  ? 'primary'
                  : role.code === 'MANAGER'
                    ? 'primary'
                    : role.code === 'CASHIER'
                      ? 'success'
                      : role.code === 'WAITER'
                        ? 'info'
                        : role.code === 'KITCHEN'
                          ? 'warning'
                          : 'neutral'
              "
            >
              {{ role.name }}
            </UBadge>
          </div>
        </div>

        <hr class="my-4 border-gray-200" />

        <!-- Permissions by Category -->
        <div class="space-y-4 max-h-96 overflow-y-auto">
          <div
            v-for="(perms, category) in permissionsData.grouped"
            :key="category"
          >
            <h4 class="font-semibold text-sm mb-2 flex items-center gap-2">
              <UIcon name="i-heroicons-folder" class="w-4 h-4" />
              {{ category }}
            </h4>
            <div class="grid gap-2">
              <div
                v-for="perm in perms"
                :key="perm.id"
                class="flex items-center justify-between p-2 rounded"
                :class="
                  perm.isEnabled
                    ? 'bg-green-50 dark:bg-green-900/20'
                    : 'bg-gray-50 dark:bg-gray-800 opacity-50'
                "
              >
                <div class="flex-1">
                  <div class="flex items-center gap-2">
                    <code class="text-xs font-medium">{{ perm.code }}</code>
                    <UBadge v-if="perm.isOverridden" color="warning" size="xs">
                      Override
                    </UBadge>
                  </div>
                  <p class="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {{ perm.description || perm.name }}
                  </p>
                </div>
                <div class="flex items-center gap-2">
                  <USwitch
                    :model-value="perm.isEnabled"
                    :disabled="togglingPermission === perm.id"
                    @update:model-value="
                      (value) => togglePermission(perm, value)
                    "
                  />
                  <UButton
                    v-if="perm.isOverridden"
                    icon="i-heroicons-arrow-path"
                    size="xs"
                    variant="ghost"
                    color="warning"
                    :loading="removingOverride === perm.id"
                    @click="removeOverride(perm)"
                    title="Revert to business type default"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <template #footer="{ close }">
      <div class="flex justify-between items-center w-full">
        <p class="text-xs text-gray-500">
          Toggle permissions to override business type defaults. Orange badge
          indicates overridden permissions.
        </p>
        <UButton variant="outline" color="neutral" @click="close">
          Close
        </UButton>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
const { confirm } = useConfirmDialog();

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
const showPermissionsModal = ref(false);
const loadingPermissions = ref(false);
const permissionsData = ref<any>(null);
const addingUser = ref(false);
const userError = ref("");
const togglingPermission = ref<string | null>(null);
const removingOverride = ref<string | null>(null);

const roleOptions = [
  { value: "OWNER", label: "Owner - Full access" },
  { value: "MANAGER", label: "Manager - Admin access" },
  { value: "STAFF", label: "Staff - Standard access" },
  { value: "CASHIER", label: "Cashier - POS access" },
  { value: "WAITER", label: "Waiter - Order management" },
  { value: "KITCHEN", label: "Kitchen - Order fulfillment" },
];

const defaultRole = roleOptions[2]; // STAFF

const newUser = ref({
  email: "",
  name: "",
  password: "",
  role: defaultRole as { value: string; label: string } | string,
});

// Watch for permissions modal open and fetch data
watch(showPermissionsModal, async (isOpen) => {
  if (isOpen && !permissionsData.value) {
    await loadPermissionsData();
  }
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
  userError.value = "";
  addingUser.value = true;

  try {
    // Extract role value - USelectMenu stores object, we need the value
    const roleValue =
      typeof newUser.value.role === "object"
        ? (newUser.value.role as { value: string })?.value
        : newUser.value.role;

    const response = await $fetch(`/api/platform/tenants/${tenantId}/users`, {
      method: "POST",
      body: {
        email: newUser.value.email,
        name: newUser.value.name,
        password: newUser.value.password,
        role: roleValue || "STAFF",
      },
    });

    // Success
    const toast = useToast();
    toast.add({
      title: "User added successfully",
      description: `${response.user.email} has been added to the tenant`,
      icon: "i-heroicons-check-circle",
      color: "success",
    });

    closeAddUserModal();
    refresh();
  } catch (error: any) {
    userError.value =
      error?.data?.statusMessage || error?.message || "Failed to add user";
    console.error("Failed to add user:", error);
  } finally {
    addingUser.value = false;
  }
};

const closeAddUserModal = () => {
  showAddUserModal.value = false;
  userError.value = "";
  newUser.value = {
    email: "",
    name: "",
    password: "",
    role: defaultRole,
  };
};

const deleteUser = async (userId: string) => {
  const toast = useToast();

  const confirmed = await confirm({
    title: "Delete User",
    message: "Are you sure you want to delete this user?",
    confirmText: "Delete",
    confirmColor: "error",
  });
  if (!confirmed) return;

  try {
    await $fetch(`/api/platform/tenants/${tenantId}/users/${userId}`, {
      method: "DELETE",
    });

    toast.add({
      title: "User deleted",
      icon: "i-heroicons-trash",
      color: "success",
    });

    refresh();
  } catch (error: any) {
    toast.add({
      title: "Failed to delete user",
      description: error?.data?.statusMessage || "An error occurred",
      icon: "i-heroicons-exclamation-triangle",
      color: "error",
    });
    console.error("Failed to delete user:", error);
  }
};

const toggleTenantStatus = async () => {
  const action = tenant.value?.isActive ? "deactivate" : "activate";
  const confirmed = await confirm({
    title: action === "deactivate" ? "Deactivate Tenant" : "Activate Tenant",
    message: `Are you sure you want to ${action} this tenant?`,
    confirmText: action === "deactivate" ? "Deactivate" : "Activate",
    confirmColor: action === "deactivate" ? "error" : "success",
  });
  if (!confirmed) return;

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

const togglePermission = async (permission: any, isEnabled: boolean) => {
  const toast = useToast();
  togglingPermission.value = permission.id;

  try {
    await $fetch(`/api/platform/tenants/${tenantId}/permissions/override`, {
      method: "POST",
      body: {
        permissionId: permission.id,
        roleCode: "OWNER", // Default to OWNER role for now
        isGranted: isEnabled,
        note: `Manual ${isEnabled ? "enable" : "disable"} by platform admin`,
      },
    });

    toast.add({
      title: "Permission updated",
      description: `${permission.code} ${isEnabled ? "enabled" : "disabled"}`,
      icon: "i-heroicons-check-circle",
      color: "success",
    });

    // Refresh permissions data
    loadPermissionsData();
  } catch (error: any) {
    toast.add({
      title: "Failed to update permission",
      description: error?.data?.statusMessage || "An error occurred",
      icon: "i-heroicons-exclamation-triangle",
      color: "error",
    });
  } finally {
    togglingPermission.value = null;
  }
};

const removeOverride = async (permission: any) => {
  const toast = useToast();
  removingOverride.value = permission.id;

  const confirmed = await confirm({
    title: "Revert Override",
    message: `Revert "${permission.code}" to business type default?`,
    confirmText: "Revert",
    confirmColor: "warning",
  });
  if (!confirmed) {
    removingOverride.value = null;
    return;
  }

  try {
    await $fetch(
      `/api/platform/tenants/${tenantId}/permissions/override/${permission.id}?roleCode=OWNER`,
      { method: "DELETE" },
    );

    toast.add({
      title: "Override removed",
      description: `${permission.code} reverted to business type default`,
      icon: "i-heroicons-arrow-path",
      color: "success",
    });

    // Refresh permissions data
    loadPermissionsData();
  } catch (error: any) {
    toast.add({
      title: "Failed to remove override",
      description: error?.data?.statusMessage || "An error occurred",
      icon: "i-heroicons-exclamation-triangle",
      color: "error",
    });
  } finally {
    removingOverride.value = null;
  }
};

const loadPermissionsData = async () => {
  loadingPermissions.value = true;
  try {
    const response = await $fetch(
      `/api/platform/tenants/${tenantId}/permissions`,
    );
    permissionsData.value = response;
  } catch (error) {
    console.error("Failed to load permissions:", error);
  } finally {
    loadingPermissions.value = false;
  }
};
</script>
