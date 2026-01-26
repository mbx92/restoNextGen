import { requireAdminRole } from "~/server/utils/auth-helpers";
import { getAuditLogs } from "~/server/utils/audit";

/**
 * GET /api/admin/audit
 * Get audit logs for current tenant (OWNER/MANAGER only)
 */
export default defineEventHandler(async (event) => {
  const session = await requireAdminRole(event);
  const tenantId = session.user.tenantId!;

  // Get query params
  const query = getQuery(event);
  const entity = query.entity as string | undefined;
  const entityId = query.entityId as string | undefined;
  const userId = query.userId as string | undefined;
  const limit = query.limit ? Number(query.limit) : 100;
  const offset = query.offset ? Number(query.offset) : 0;

  const result = await getAuditLogs(tenantId, {
    entity,
    entityId,
    userId,
    limit,
    offset,
  });

  return result;
});
