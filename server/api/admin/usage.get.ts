import { getTenantUsage } from "~/server/utils/feature-gating";
import { requireAdminRole } from "~/server/utils/auth-helpers";

/**
 * Get current tenant's plan usage stats
 */
export default defineEventHandler(async (event) => {
  await requireAdminRole(event);

  const usage = await getTenantUsage(event);

  return usage;
});
