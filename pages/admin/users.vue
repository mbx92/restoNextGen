<script setup lang="ts">
import type { UserRole } from "@prisma/client";
import { PERMISSIONS } from "~/server/utils/rbac";

const { confirm } = useConfirmDialog();

definePageMeta({
  layout: "admin",
  middleware: "admin-auth",
});

// Get session to check permissions
const { data: session } = await useFetch("/api/admin/auth/session");

// Permission check helper
const canAccess = (permission: keyof typeof PERMISSIONS) => {
  if (!session.value?.user?.role) return false;
  const allowedRoles = PERMISSIONS[permission];
  return allowedRoles.includes(session.value.user.role as any);
};

// Check permission
if (!canAccess("VIEW_USERS")) {
  throw createError({
    statusCode: 403,
    statusMessage: "You don't have permission to access this page",
  });
}

// PermissionRow Component
const PermissionRow = defineComponent({
  props: {
    permission: {
      type: String as PropType<keyof typeof PERMISSIONS>,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const allowedRoles = PERMISSIONS[props.permission];
    const roleColors: Record<UserRole, string> = {
      OWNER: "purple",
      MANAGER: "primary",
      CASHIER: "success",
      WAITER: "info",
      KITCHEN: "warning",
      CUSTOMER: "neutral",
    };

    return () =>
      h(
        "div",
        {
          class:
            "flex items-start justify-between p-3 bg-stone-50 dark:bg-stone-800 rounded-lg",
        },
        [
          h("div", { class: "flex-1" }, [
            h(
              "div",
              {
                class: "font-medium text-sm text-stone-900 dark:text-stone-100",
              },
              props.permission.replace(/_/g, " "),
            ),
            h(
              "div",
              { class: "text-xs text-stone-500 dark:text-stone-400 mt-1" },
              props.description,
            ),
          ]),
          h(
            "div",
            { class: "flex flex-wrap gap-1 ml-4" },
            allowedRoles.map((role) =>
              h(
                resolveComponent("UBadge"),
                {
                  color: roleColors[role as UserRole],
                  size: "xs",
                },
                () => role,
              ),
            ),
          ),
        ],
      );
  },
});

interface User {
  id: string;
  email: string;
  name: string;
  phoneNumber?: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const toast = useToast();

// State
const users = ref<User[]>([]);
const loading = ref(false);
const showCreateModal = ref(false);
const showEditModal = ref(false);
const showRbacModal = ref(false);
const selectedUser = ref<User | null>(null);

// Check if user can manage users
const canManageUsers = computed(() => canAccess("MANAGE_USERS"));

// Role options
const roleOptions = [
  {
    value: "OWNER",
    label: "Owner",
    description: "Full access to all features",
    icon: "i-heroicons-shield-check",
  },
  {
    value: "MANAGER",
    label: "Manager",
    description: "Manage operations and staff",
    icon: "i-heroicons-user-group",
  },
  {
    value: "CASHIER",
    label: "Cashier",
    description: "Handle payments and POS",
    icon: "i-heroicons-calculator",
  },
  {
    value: "WAITER",
    label: "Waiter",
    description: "Create and manage orders",
    icon: "i-heroicons-clipboard-document-list",
  },
  {
    value: "KITCHEN",
    label: "Kitchen Staff",
    description: "Kitchen display and order status",
    icon: "i-heroicons-fire",
  },
  {
    value: "CUSTOMER",
    label: "Customer",
    description: "Place orders and reviews",
    icon: "i-heroicons-user",
  },
];

// Default roles for forms
const defaultCreateRole =
  roleOptions.find((r) => r.value === "CUSTOMER") || roleOptions[0];
const defaultEditRole =
  roleOptions.find((r) => r.value === "CUSTOMER") || roleOptions[0];

// Form data
const createForm = ref({
  email: "",
  name: "",
  phoneNumber: "",
  role: defaultCreateRole as any,
  password: "",
});

const editForm = ref({
  name: "",
  phoneNumber: "",
  role: defaultEditRole as any,
  isActive: true,
  password: "",
});

// Role colors
const roleColors: Record<UserRole, string> = {
  OWNER: "purple",
  MANAGER: "primary",
  CASHIER: "warning",
  WAITER: "info",
  KITCHEN: "error",
  CUSTOMER: "neutral",
};

// Table columns
const columns = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "email", header: "Email" },
  { accessorKey: "role", header: "Role" },
  { accessorKey: "phoneNumber", header: "Phone" },
  { accessorKey: "status", header: "Status" },
  { accessorKey: "actions", header: "Actions" },
];

// Fetch users
async function fetchUsers() {
  loading.value = true;
  try {
    const response = await $fetch("/api/admin/users");
    users.value = response.users;
  } catch (error: any) {
    toast.add({
      title: "Error",
      description: error.data?.message || "Failed to fetch users",
      color: "error",
    });
  } finally {
    loading.value = false;
  }
}

// Create user
async function handleCreate() {
  loading.value = true;
  try {
    // Extract role value from object
    const roleValue =
      typeof createForm.value.role === "object"
        ? (createForm.value.role as { value: string })?.value
        : createForm.value.role;

    await $fetch("/api/admin/users", {
      method: "POST",
      body: {
        email: createForm.value.email,
        name: createForm.value.name,
        phoneNumber: createForm.value.phoneNumber,
        role: roleValue,
        password: createForm.value.password,
      },
    });

    toast.add({
      title: "Success",
      description: "User created successfully",
      color: "success",
    });

    showCreateModal.value = false;
    resetCreateForm();
    await fetchUsers();
  } catch (error: any) {
    toast.add({
      title: "Error",
      description: error.data?.message || "Failed to create user",
      color: "error",
    });
  } finally {
    loading.value = false;
  }
}

// Edit user
function openEditModal(user: User) {
  selectedUser.value = user;
  // Find the role object from roleOptions
  const roleObj =
    roleOptions.find((r) => r.value === user.role) || roleOptions[0];
  editForm.value = {
    name: user.name,
    phoneNumber: user.phoneNumber || "",
    role: roleObj as any,
    isActive: user.isActive,
    password: "",
  };
  showEditModal.value = true;
}

async function handleUpdate() {
  if (!selectedUser.value) return;

  loading.value = true;
  try {
    // Extract role value from object
    const roleValue =
      typeof editForm.value.role === "object"
        ? (editForm.value.role as { value: string })?.value
        : editForm.value.role;

    await $fetch(`/api/admin/users/${selectedUser.value.id}`, {
      method: "PATCH",
      body: {
        name: editForm.value.name,
        phoneNumber: editForm.value.phoneNumber,
        role: roleValue,
        isActive: editForm.value.isActive,
        password: editForm.value.password,
      },
    });

    toast.add({
      title: "Success",
      description: "User updated successfully",
      color: "success",
    });

    showEditModal.value = false;
    selectedUser.value = null;
    await fetchUsers();
  } catch (error: any) {
    toast.add({
      title: "Error",
      description: error.data?.message || "Failed to update user",
      color: "error",
    });
  } finally {
    loading.value = false;
  }
}

// Delete user
async function handleDelete(user: User) {
  const confirmed = await confirm({
    title: "Deactivate User",
    message: `Are you sure you want to deactivate ${user.name}?`,
    confirmText: "Deactivate",
    confirmColor: "error",
  });
  if (!confirmed) return;

  loading.value = true;
  try {
    await $fetch(`/api/admin/users/${user.id}`, {
      method: "DELETE",
    });

    toast.add({
      title: "Success",
      description: "User deactivated successfully",
      color: "success",
    });

    await fetchUsers();
  } catch (error: any) {
    toast.add({
      title: "Error",
      description: error.data?.message || "Failed to deactivate user",
      color: "error",
    });
  } finally {
    loading.value = false;
  }
}

// Reset forms
function resetCreateForm() {
  createForm.value = {
    email: "",
    name: "",
    phoneNumber: "",
    role: "CUSTOMER",
    password: "",
  };
}

// Load data on mount
onMounted(() => {
  fetchUsers();
});
</script>

<template>
  <div class="p-6">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold">User Management</h1>
        <p class="text-gray-600 dark:text-gray-400">
          Manage staff and customer accounts
        </p>
      </div>
      <div class="flex gap-2">
        <UButton
          icon="i-heroicons-shield-check"
          color="neutral"
          variant="outline"
          @click="showRbacModal = true"
        >
          View Permissions
        </UButton>
        <UButton
          v-if="canManageUsers"
          icon="i-heroicons-plus"
          color="primary"
          @click="showCreateModal = true"
        >
          Add User
        </UButton>
      </div>
    </div>

    <!-- Users Table -->
    <UCard>
      <ClientOnly>
        <UTable :data="users" :columns="columns" :loading="loading">
          <!-- Name Cell -->
          <template #name-cell="{ row }">
            <div class="flex items-center gap-3">
              <UAvatar :alt="row.original.name" size="sm" />
              <span class="font-medium">{{ row.original.name }}</span>
            </div>
          </template>

          <!-- Role Cell -->
          <template #role-cell="{ row }">
            <UBadge :color="roleColors[row.original.role]" variant="subtle">
              {{ row.original.role }}
            </UBadge>
          </template>

          <!-- Phone Cell -->
          <template #phoneNumber-cell="{ row }">
            <span class="text-gray-600 dark:text-gray-400">
              {{ row.original.phoneNumber || "-" }}
            </span>
          </template>

          <!-- Status Cell -->
          <template #status-cell="{ row }">
            <UBadge
              :color="row.original.isActive ? 'success' : 'neutral'"
              variant="subtle"
            >
              {{ row.original.isActive ? "Active" : "Inactive" }}
            </UBadge>
          </template>

          <!-- Actions Cell -->
          <template #actions-cell="{ row }">
            <div v-if="canManageUsers" class="flex gap-2">
              <UButton
                icon="i-heroicons-pencil"
                size="xs"
                color="neutral"
                variant="ghost"
                @click="openEditModal(row.original)"
              />
              <UButton
                icon="i-heroicons-trash"
                size="xs"
                color="error"
                variant="ghost"
                @click="handleDelete(row.original)"
              />
            </div>
            <span v-else class="text-gray-400 text-sm">-</span>
          </template>
        </UTable>
        <template #fallback>
          <div class="p-4 text-center text-gray-500">Loading users...</div>
        </template>
      </ClientOnly>
    </UCard>

    <!-- Create User Modal -->
    <UModal
      v-model:open="showCreateModal"
      title="Add New User"
      description="Create a new user account"
    >
      <template #body>
        <form class="space-y-4" @submit.prevent="handleCreate">
          <UFormField label="Full Name" required>
            <UInput
              v-model="createForm.name"
              placeholder="Enter full name"
              class="w-full"
            />
          </UFormField>

          <UFormField label="Email" required>
            <UInput
              v-model="createForm.email"
              type="email"
              placeholder="user@example.com"
              class="w-full"
            />
          </UFormField>

          <UFormField label="Phone Number">
            <UInput
              v-model="createForm.phoneNumber"
              placeholder="+62 812 3456 7890"
              class="w-full"
            />
          </UFormField>

          <UFormField label="Role" required>
            <USelectMenu
              v-model="createForm.role"
              :items="roleOptions"
              value-key="value"
              placeholder="Select role"
              class="w-full"
            >
              <template #item="{ item }">
                <div class="flex items-center gap-3">
                  <UIcon :name="item.icon" class="w-5 h-5" />
                  <div>
                    <div class="font-medium">{{ item.label }}</div>
                    <div class="text-xs text-gray-500">
                      {{ item.description }}
                    </div>
                  </div>
                </div>
              </template>
            </USelectMenu>
          </UFormField>

          <UFormField label="Password" required>
            <UInput
              v-model="createForm.password"
              type="password"
              placeholder="Min. 6 characters"
              class="w-full"
            />
          </UFormField>
        </form>
      </template>

      <template #footer="{ close }">
        <div class="flex justify-end gap-2">
          <UButton variant="outline" color="neutral" @click="close">
            Cancel
          </UButton>
          <UButton color="primary" :loading="loading" @click="handleCreate">
            Create User
          </UButton>
        </div>
      </template>
    </UModal>

    <!-- Edit User Modal -->
    <UModal
      v-model:open="showEditModal"
      title="Edit User"
      description="Update user information"
    >
      <template #body>
        <form class="space-y-4" @submit.prevent="handleUpdate">
          <UFormField label="Full Name" required>
            <UInput
              v-model="editForm.name"
              placeholder="Enter full name"
              class="w-full"
            />
          </UFormField>

          <UFormField label="Phone Number">
            <UInput
              v-model="editForm.phoneNumber"
              placeholder="+62 812 3456 7890"
              class="w-full"
            />
          </UFormField>

          <UFormField label="Role" required>
            <USelectMenu
              v-model="editForm.role"
              :items="roleOptions"
              value-key="value"
              placeholder="Select role"
              class="w-full"
            >
              <template #item="{ item }">
                <div class="flex items-center gap-3">
                  <UIcon :name="item.icon" class="w-5 h-5" />
                  <div>
                    <div class="font-medium">{{ item.label }}</div>
                    <div class="text-xs text-gray-500">
                      {{ item.description }}
                    </div>
                  </div>
                </div>
              </template>
            </USelectMenu>
          </UFormField>

          <UFormField label="Status">
            <div class="flex items-center gap-2">
              <USwitch v-model="editForm.isActive" />
              <span class="text-sm text-stone-600">
                {{ editForm.isActive ? "Active" : "Inactive" }}
              </span>
            </div>
          </UFormField>

          <UFormField label="New Password">
            <UInput
              v-model="editForm.password"
              type="password"
              placeholder="Leave blank to keep current password"
              class="w-full"
            />
            <template #help>
              <span class="text-xs text-stone-400">
                Only fill this if you want to change the password
              </span>
            </template>
          </UFormField>
        </form>
      </template>

      <template #footer="{ close }">
        <div class="flex justify-end gap-2">
          <UButton variant="outline" color="neutral" @click="close">
            Cancel
          </UButton>
          <UButton color="primary" :loading="loading" @click="handleUpdate">
            Update User
          </UButton>
        </div>
      </template>
    </UModal>

    <!-- RBAC Permissions Modal -->
    <UModal
      v-model:open="showRbacModal"
      title="Role-Based Access Control (RBAC)"
      description="Permission matrix showing what each role can do"
    >
      <template #body>
        <div class="space-y-6">
          <!-- Legend -->
          <div class="flex flex-wrap gap-2">
            <UBadge color="purple">OWNER</UBadge>
            <UBadge color="primary">MANAGER</UBadge>
            <UBadge color="success">CASHIER</UBadge>
            <UBadge color="info">WAITER</UBadge>
            <UBadge color="warning">KITCHEN</UBadge>
            <UBadge color="neutral">CUSTOMER</UBadge>
          </div>

          <!-- Permissions grouped by category -->
          <div class="space-y-4">
            <!-- User Management -->
            <div>
              <h3
                class="font-semibold text-sm text-stone-900 dark:text-stone-100 mb-2"
              >
                User Management
              </h3>
              <div class="space-y-2">
                <PermissionRow
                  permission="MANAGE_USERS"
                  description="Create, update, and manage users"
                />
                <PermissionRow
                  permission="VIEW_USERS"
                  description="View user list and details"
                />
              </div>
            </div>

            <!-- Menu Management -->
            <div>
              <h3
                class="font-semibold text-sm text-stone-900 dark:text-stone-100 mb-2"
              >
                Menu Management
              </h3>
              <div class="space-y-2">
                <PermissionRow
                  permission="MANAGE_MENU"
                  description="Create, update, delete menu items"
                />
                <PermissionRow
                  permission="VIEW_MENU"
                  description="View menu items"
                />
                <PermissionRow
                  permission="MANAGE_CATEGORIES"
                  description="Manage menu categories"
                />
              </div>
            </div>

            <!-- Orders -->
            <div>
              <h3
                class="font-semibold text-sm text-stone-900 dark:text-stone-100 mb-2"
              >
                Orders
              </h3>
              <div class="space-y-2">
                <PermissionRow
                  permission="CREATE_ORDER"
                  description="Create new orders"
                />
                <PermissionRow
                  permission="VIEW_ALL_ORDERS"
                  description="View all orders in the system"
                />
                <PermissionRow
                  permission="VIEW_OWN_ORDERS"
                  description="View own orders only"
                />
                <PermissionRow
                  permission="UPDATE_ORDER_STATUS"
                  description="Update order status"
                />
                <PermissionRow
                  permission="CANCEL_ORDER"
                  description="Cancel orders"
                />
              </div>
            </div>

            <!-- Tables -->
            <div>
              <h3
                class="font-semibold text-sm text-stone-900 dark:text-stone-100 mb-2"
              >
                Tables
              </h3>
              <div class="space-y-2">
                <PermissionRow
                  permission="MANAGE_TABLES"
                  description="Create, update, delete tables"
                />
                <PermissionRow
                  permission="VIEW_TABLES"
                  description="View table list and status"
                />
              </div>
            </div>

            <!-- Reservations -->
            <div>
              <h3
                class="font-semibold text-sm text-stone-900 dark:text-stone-100 mb-2"
              >
                Reservations
              </h3>
              <div class="space-y-2">
                <PermissionRow
                  permission="MANAGE_RESERVATIONS"
                  description="Approve, reject, manage reservations"
                />
                <PermissionRow
                  permission="VIEW_RESERVATIONS"
                  description="View reservation list"
                />
                <PermissionRow
                  permission="CREATE_RESERVATION"
                  description="Create new reservation"
                />
              </div>
            </div>

            <!-- Payments -->
            <div>
              <h3
                class="font-semibold text-sm text-stone-900 dark:text-stone-100 mb-2"
              >
                Payments
              </h3>
              <div class="space-y-2">
                <PermissionRow
                  permission="PROCESS_PAYMENT"
                  description="Process and confirm payments"
                />
                <PermissionRow
                  permission="VIEW_PAYMENTS"
                  description="View payment history"
                />
              </div>
            </div>

            <!-- Reviews -->
            <div>
              <h3
                class="font-semibold text-sm text-stone-900 dark:text-stone-100 mb-2"
              >
                Reviews
              </h3>
              <div class="space-y-2">
                <PermissionRow
                  permission="MODERATE_REVIEWS"
                  description="Approve, reject, manage reviews"
                />
                <PermissionRow
                  permission="WRITE_REVIEW"
                  description="Write customer reviews"
                />
              </div>
            </div>

            <!-- Site Settings -->
            <div>
              <h3
                class="font-semibold text-sm text-stone-900 dark:text-stone-100 mb-2"
              >
                Site Settings
              </h3>
              <div class="space-y-2">
                <PermissionRow
                  permission="MANAGE_SETTINGS"
                  description="Manage site settings"
                />
                <PermissionRow
                  permission="MANAGE_THEME"
                  description="Customize site theme"
                />
                <PermissionRow
                  permission="MANAGE_LANDING"
                  description="Edit landing page content"
                />
              </div>
            </div>

            <!-- Dashboard -->
            <div>
              <h3
                class="font-semibold text-sm text-stone-900 dark:text-stone-100 mb-2"
              >
                Dashboard & Analytics
              </h3>
              <div class="space-y-2">
                <PermissionRow
                  permission="VIEW_DASHBOARD"
                  description="Access admin dashboard"
                />
                <PermissionRow
                  permission="VIEW_ANALYTICS"
                  description="View analytics and reports"
                />
              </div>
            </div>

            <!-- Kitchen Display -->
            <div>
              <h3
                class="font-semibold text-sm text-stone-900 dark:text-stone-100 mb-2"
              >
                Kitchen Display
              </h3>
              <div class="space-y-2">
                <PermissionRow
                  permission="VIEW_KITCHEN_DISPLAY"
                  description="View kitchen display system"
                />
              </div>
            </div>
          </div>
        </div>
      </template>

      <template #footer="{ close }">
        <div class="flex justify-end">
          <UButton variant="outline" color="neutral" @click="close">
            Close
          </UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>

<style scoped>
/* Add any custom styles if needed */
</style>
