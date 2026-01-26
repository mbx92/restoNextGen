<script setup lang="ts">
definePageMeta({
  layout: "platform",
  middleware: "platform-auth",
});

// Fetch RBAC data
const { data: permissionsData, pending: loadingPermissions } = await useFetch(
  "/api/platform/rbac/permissions",
);
const { data: roles, pending: loadingRoles } = await useFetch(
  "/api/platform/rbac/roles",
);
const { data: matrix, pending: loadingMatrix } = await useFetch(
  "/api/platform/rbac/matrix",
);

const activeTab = ref("permissions");

const tabs = [
  {
    key: "permissions",
    label: "Permissions",
    icon: "i-heroicons-shield-check",
  },
  { key: "roles", label: "Roles", icon: "i-heroicons-user-group" },
  {
    key: "matrix",
    label: "Permission Matrix",
    icon: "i-heroicons-table-cells",
  },
  {
    key: "business-types",
    label: "Business Types",
    icon: "i-heroicons-building-storefront",
  },
];

// Business types
const businessTypes = ["RESTAURANT", "CAFE", "BAKERY"];
const selectedBusinessType = ref("RESTAURANT");

const {
  data: businessTypeConfig,
  refresh: refreshBusinessType,
  pending: loadingBusinessType,
} = await useFetch(
  () => `/api/platform/rbac/business-types/${selectedBusinessType.value}`,
);

watch(selectedBusinessType, () => {
  refreshBusinessType();
});

// Loading state
const isLoading = computed(
  () => loadingPermissions.value || loadingRoles.value || loadingMatrix.value,
);
</script>

<template>
  <div class="p-6 space-y-6">
    <!-- Header -->
    <div>
      <h1 class="text-3xl font-bold">RBAC Management</h1>
      <p class="text-gray-600 dark:text-gray-400 mt-1">
        Manage roles, permissions, and business type templates
      </p>
    </div>

    <!-- Tab Buttons -->
    <div class="flex gap-2 border-b border-gray-200 dark:border-gray-700 pb-2">
      <UButton
        v-for="tab in tabs"
        :key="tab.key"
        :variant="activeTab === tab.key ? 'solid' : 'ghost'"
        :color="activeTab === tab.key ? 'primary' : 'neutral'"
        :icon="tab.icon"
        @click="activeTab = tab.key"
      >
        {{ tab.label }}
      </UButton>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="p-8 text-center text-gray-500">
      <UIcon
        name="i-heroicons-arrow-path"
        class="w-6 h-6 animate-spin mx-auto mb-2"
      />
      <p>Loading RBAC data...</p>
    </div>

    <!-- Tab Content -->
    <div v-else>
      <!-- Permissions Tab -->
      <div v-if="activeTab === 'permissions'">
        <UCard>
          <template #header>
            <div class="flex justify-between items-center">
              <h2 class="text-lg font-semibold">All Permissions</h2>
              <UBadge color="primary" variant="subtle">
                {{ permissionsData?.permissions?.length || 0 }} permissions
              </UBadge>
            </div>
          </template>

          <div v-if="permissionsData?.grouped" class="space-y-6">
            <div
              v-for="(perms, category) in permissionsData.grouped"
              :key="category"
            >
              <h3
                class="font-semibold text-sm text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2"
              >
                <UIcon name="i-heroicons-folder" class="w-4 h-4" />
                {{ category }}
              </h3>
              <div class="grid gap-2">
                <div
                  v-for="perm in perms"
                  :key="perm.id"
                  class="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div class="flex items-start justify-between">
                    <div class="flex-1">
                      <div class="flex items-center gap-2">
                        <code
                          class="text-sm font-mono bg-white dark:bg-gray-900 px-2 py-1 rounded"
                        >
                          {{ perm.code }}
                        </code>
                        <UBadge v-if="perm.isSystem" color="neutral" size="xs">
                          System
                        </UBadge>
                      </div>
                      <p class="text-sm font-medium mt-1">{{ perm.name }}</p>
                      <p class="text-xs text-gray-500 mt-1">
                        {{ perm.description }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="text-center py-8 text-gray-500">
            <UIcon
              name="i-heroicons-shield-exclamation"
              class="w-12 h-12 mx-auto mb-2"
            />
            <p>No permissions found</p>
          </div>
        </UCard>
      </div>

      <!-- Roles Tab -->
      <div v-else-if="activeTab === 'roles'">
        <UCard>
          <template #header>
            <div class="flex justify-between items-center">
              <h2 class="text-lg font-semibold">All Roles</h2>
              <UBadge color="primary" variant="subtle">
                {{ roles?.length || 0 }} roles
              </UBadge>
            </div>
          </template>

          <div v-if="roles?.length" class="grid gap-4">
            <div
              v-for="role in roles"
              :key="role.id"
              class="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
            >
              <div class="space-y-3">
                <div class="flex items-start justify-between">
                  <div>
                    <div class="flex items-center gap-2">
                      <h3 class="font-semibold">{{ role.name }}</h3>
                      <UBadge
                        :color="
                          role.code === 'OWNER'
                            ? 'purple'
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
                        {{ role.code }}
                      </UBadge>
                      <UBadge
                        v-if="role.isSystem"
                        color="neutral"
                        size="xs"
                        variant="outline"
                      >
                        System
                      </UBadge>
                    </div>
                    <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {{ role.description }}
                    </p>
                  </div>
                  <div class="text-right">
                    <p class="text-xs text-gray-500">Hierarchy</p>
                    <p class="text-lg font-bold">{{ role.hierarchy }}</p>
                  </div>
                </div>

                <div>
                  <p class="text-xs text-gray-500 mb-2">
                    {{ role.rolePermissions?.length || 0 }} permissions
                  </p>
                  <div class="flex flex-wrap gap-1">
                    <UBadge
                      v-for="rp in (role.rolePermissions || []).slice(0, 10)"
                      :key="rp.permission?.id"
                      size="xs"
                      color="neutral"
                      variant="outline"
                    >
                      {{ rp.permission?.code }}
                    </UBadge>
                    <UBadge
                      v-if="(role.rolePermissions?.length || 0) > 10"
                      size="xs"
                      color="neutral"
                    >
                      +{{ role.rolePermissions.length - 10 }} more
                    </UBadge>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="text-center py-8 text-gray-500">
            <UIcon
              name="i-heroicons-user-group"
              class="w-12 h-12 mx-auto mb-2"
            />
            <p>No roles found</p>
          </div>
        </UCard>
      </div>

      <!-- Matrix Tab -->
      <div v-else-if="activeTab === 'matrix'">
        <UCard>
          <template #header>
            <h2 class="text-lg font-semibold">Role-Permission Matrix</h2>
          </template>

          <div
            v-if="matrix?.roles?.length && matrix?.permissions?.length"
            class="overflow-x-auto"
          >
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b dark:border-gray-700">
                  <th
                    class="text-left p-2 font-semibold sticky left-0 bg-white dark:bg-gray-900"
                  >
                    Permission
                  </th>
                  <th
                    v-for="role in matrix.roles"
                    :key="role.id"
                    class="text-center p-2 font-semibold"
                  >
                    <UBadge
                      :color="
                        role.code === 'OWNER'
                          ? 'purple'
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
                      size="xs"
                    >
                      {{ role.code }}
                    </UBadge>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="perm in matrix.permissions"
                  :key="perm.id"
                  class="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <td class="p-2 sticky left-0 bg-white dark:bg-gray-900">
                    <code class="text-xs">{{ perm.code }}</code>
                  </td>
                  <td
                    v-for="role in matrix.roles"
                    :key="role.id"
                    class="text-center p-2"
                  >
                    <UIcon
                      v-if="matrix.matrixMap?.[`${role.id}-${perm.id}`]"
                      name="i-heroicons-check-circle"
                      class="text-green-500 w-5 h-5 mx-auto"
                    />
                    <UIcon
                      v-else
                      name="i-heroicons-x-circle"
                      class="text-gray-300 dark:text-gray-700 w-5 h-5 mx-auto"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-else class="text-center py-8 text-gray-500">
            <UIcon
              name="i-heroicons-table-cells"
              class="w-12 h-12 mx-auto mb-2"
            />
            <p>No matrix data available</p>
          </div>
        </UCard>
      </div>

      <!-- Business Types Tab -->
      <div v-else-if="activeTab === 'business-types'" class="space-y-4">
        <!-- Business Type Selector -->
        <UCard>
          <div class="flex gap-2">
            <UButton
              v-for="type in businessTypes"
              :key="type"
              :variant="selectedBusinessType === type ? 'solid' : 'outline'"
              :color="selectedBusinessType === type ? 'primary' : 'neutral'"
              @click="selectedBusinessType = type"
            >
              {{ type }}
            </UButton>
          </div>
        </UCard>

        <!-- Loading Business Type -->
        <div v-if="loadingBusinessType" class="p-8 text-center text-gray-500">
          <UIcon
            name="i-heroicons-arrow-path"
            class="w-6 h-6 animate-spin mx-auto mb-2"
          />
          <p>Loading {{ selectedBusinessType }} configuration...</p>
        </div>

        <!-- Config Display -->
        <UCard v-else-if="businessTypeConfig">
          <template #header>
            <h2 class="text-lg font-semibold">
              {{ selectedBusinessType }} Configuration
            </h2>
          </template>

          <div class="space-y-6">
            <!-- Enabled Roles -->
            <div>
              <h3 class="font-semibold text-sm mb-3">Enabled Roles</h3>
              <div class="flex flex-wrap gap-2">
                <UBadge
                  v-for="item in (businessTypeConfig.roles || []).filter(
                    (r: any) => r.isEnabled,
                  )"
                  :key="item.role?.id"
                  :color="
                    item.role?.code === 'OWNER'
                      ? 'purple'
                      : item.role?.code === 'MANAGER'
                        ? 'primary'
                        : item.role?.code === 'CASHIER'
                          ? 'success'
                          : item.role?.code === 'WAITER'
                            ? 'info'
                            : item.role?.code === 'KITCHEN'
                              ? 'warning'
                              : 'neutral'
                  "
                >
                  {{ item.role?.name }}
                </UBadge>
              </div>
            </div>

            <!-- Enabled Permissions -->
            <div>
              <h3 class="font-semibold text-sm mb-3">
                Enabled Permissions ({{
                  (businessTypeConfig.permissions || []).filter(
                    (p: any) => p.isEnabled,
                  ).length
                }})
              </h3>
              <div class="grid gap-2">
                <div
                  v-for="item in (businessTypeConfig.permissions || []).filter(
                    (p: any) => p.isEnabled,
                  )"
                  :key="item.permission?.id"
                  class="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded"
                >
                  <div>
                    <code class="text-xs">{{ item.permission?.code }}</code>
                    <p class="text-xs text-gray-500 mt-1">
                      {{ item.permission?.name }}
                    </p>
                  </div>
                  <UIcon
                    name="i-heroicons-check-circle"
                    class="text-green-500 w-5 h-5"
                  />
                </div>
              </div>
            </div>

            <!-- Disabled Permissions -->
            <div
              v-if="
                (businessTypeConfig.permissions || []).some(
                  (p: any) => !p.isEnabled,
                )
              "
            >
              <h3 class="font-semibold text-sm mb-3 text-gray-500">
                Disabled Features
              </h3>
              <div class="grid gap-2 opacity-50">
                <div
                  v-for="item in (businessTypeConfig.permissions || []).filter(
                    (p: any) => !p.isEnabled,
                  )"
                  :key="item.permission?.id"
                  class="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded"
                >
                  <div>
                    <code class="text-xs">{{ item.permission?.code }}</code>
                    <p class="text-xs text-gray-500 mt-1">
                      {{ item.permission?.name }}
                    </p>
                  </div>
                  <UIcon
                    name="i-heroicons-x-circle"
                    class="text-gray-400 w-5 h-5"
                  />
                </div>
              </div>
            </div>
          </div>
        </UCard>
      </div>
    </div>
  </div>
</template>
