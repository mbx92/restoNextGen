/**
 * Composable for checking plan limits and feature availability
 */

export interface ResourceUsage {
  current: number;
  limit: number;
}

export interface TenantUsage {
  menuItems: ResourceUsage;
  tables: ResourceUsage;
  orders: ResourceUsage;
  users: ResourceUsage;
  storage: ResourceUsage;
  locations: ResourceUsage;
}

export const usePlanLimits = () => {
  const toast = useToast();

  /**
   * Fetch current tenant usage stats
   */
  const { data: usage, refresh: refreshUsage } = useFetch<TenantUsage>(
    "/api/admin/usage",
    {
      lazy: true,
    },
  );

  /**
   * Check if resource is near limit (>= 80%)
   */
  const isNearLimit = (resource: ResourceUsage): boolean => {
    if (resource.limit === -1) return false; // Unlimited
    return resource.current / resource.limit >= 0.8;
  };

  /**
   * Check if resource has reached limit
   */
  const hasReachedLimit = (resource: ResourceUsage): boolean => {
    if (resource.limit === -1) return false; // Unlimited
    return resource.current >= resource.limit;
  };

  /**
   * Get usage percentage (0-100)
   */
  const getUsagePercentage = (resource: ResourceUsage): number => {
    if (resource.limit === -1) return 0; // Unlimited
    return Math.round((resource.current / resource.limit) * 100);
  };

  /**
   * Get progress color based on usage
   */
  const getProgressColor = (resource: ResourceUsage): string => {
    const percentage = getUsagePercentage(resource);
    if (percentage >= 90) return "error";
    if (percentage >= 70) return "warning";
    return "success";
  };

  /**
   * Show upgrade prompt when limit is reached
   */
  const showUpgradePrompt = (resourceName: string) => {
    toast.add({
      title: "Plan Limit Reached",
      description: `You've reached your ${resourceName} limit. Upgrade your plan to create more.`,
      color: "warning",
      timeout: 0, // Don't auto-dismiss
      actions: [
        {
          label: "Upgrade Plan",
          click: () => {
            navigateTo("/admin/settings#subscription");
          },
        },
        {
          label: "Dismiss",
          click: () => {
            // Close toast
          },
        },
      ],
    });
  };

  /**
   * Check if can create more resources before attempting
   * Returns true if can create, shows toast and returns false if cannot
   */
  const canCreate = (
    resourceType: keyof TenantUsage,
    showToast = true,
  ): boolean => {
    if (!usage.value) return true; // No usage data yet, allow

    const resource = usage.value[resourceType];
    const reached = hasReachedLimit(resource);

    if (reached && showToast) {
      const resourceNames: Record<keyof TenantUsage, string> = {
        menuItems: "menu items",
        tables: "tables",
        orders: "orders",
        users: "users",
        storage: "storage",
        locations: "locations",
      };
      showUpgradePrompt(resourceNames[resourceType]);
    }

    return !reached;
  };

  /**
   * Format limit display (-1 = unlimited)
   */
  const formatLimit = (limit: number): string => {
    return limit === -1 ? "Unlimited" : limit.toString();
  };

  return {
    usage,
    refreshUsage,
    isNearLimit,
    hasReachedLimit,
    getUsagePercentage,
    getProgressColor,
    showUpgradePrompt,
    canCreate,
    formatLimit,
  };
};
