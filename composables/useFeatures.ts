/**
 * Composable for checking feature availability in the current tenant
 * Uses feature gating to determine if specific features are enabled
 *
 * @example
 * const { hasFeature, features, refresh } = useFeatures();
 *
 * // Check single feature
 * if (hasFeature('CUSTOM_DOMAIN')) {
 *   // Show custom domain settings
 * }
 *
 * // Use in template
 * <UButton v-if="hasFeature('ADVANCED_ANALYTICS')" />
 */

export const useFeatures = () => {
  const toast = useToast();

  /**
   * Fetch enabled features for the current tenant
   */
  const { data: features, refresh } = useFetch<Record<string, boolean>>(
    "/api/admin/features",
    {
      lazy: true,
      default: () => ({}),
    },
  );

  /**
   * Check if a specific feature is enabled
   * @param featureCode Feature code (e.g., "CUSTOM_DOMAIN", "ADVANCED_ANALYTICS")
   * @returns true if feature is enabled
   */
  const hasFeature = (featureCode: string): boolean => {
    return features.value?.[featureCode] ?? false;
  };

  /**
   * Show upgrade prompt when feature is not available
   * @param featureName Human-readable feature name for the toast
   */
  const showUpgradePrompt = (featureName: string) => {
    toast.add({
      title: "Feature Not Available",
      description: `${featureName} is not available in your current plan. Upgrade to access this feature.`,
      color: "warning",
    });
    
    // Navigate after a short delay
    setTimeout(() => {
      navigateTo("/admin/settings#subscription");
    }, 2000);
  };

  /**
   * Check if feature is enabled, show prompt if not
   * @param featureCode Feature code
   * @param featureName Human-readable name for error message
   * @returns true if feature is enabled
   */
  const requireFeature = (
    featureCode: string,
    featureName: string,
  ): boolean => {
    if (!hasFeature(featureCode)) {
      showUpgradePrompt(featureName);
      return false;
    }
    return true;
  };

  /**
   * Get list of all enabled feature codes
   */
  const getEnabledFeatures = (): string[] => {
    if (!features.value) return [];
    return Object.entries(features.value)
      .filter(([, enabled]) => enabled)
      .map(([code]) => code);
  };

  /**
   * Get list of all disabled feature codes
   */
  const getDisabledFeatures = (): string[] => {
    if (!features.value) return [];
    return Object.entries(features.value)
      .filter(([, enabled]) => !enabled)
      .map(([code]) => code);
  };

  return {
    features,
    hasFeature,
    requireFeature,
    showUpgradePrompt,
    getEnabledFeatures,
    getDisabledFeatures,
    refresh,
  };
};
