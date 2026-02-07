import { getTenantFeatures } from "~/server/utils/feature-gating";

/**
 * Get all enabled features for the authenticated tenant
 * Returns an object with feature codes as keys and enabled status as values
 *
 * @example
 * {
 *   "CUSTOM_DOMAIN": true,
 *   "ADVANCED_ANALYTICS": true,
 *   "API_ACCESS": false,
 *   "WHITE_LABEL": false
 * }
 */
export default defineEventHandler(async (event) => {
  // This endpoint is protected by admin-auth middleware
  // which ensures the user is authenticated and has tenantId

  const features = await getTenantFeatures(event);

  return features;
});
