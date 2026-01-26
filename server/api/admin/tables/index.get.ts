import prisma from "~/server/db/prisma";
import { requirePermission } from "~/server/utils/auth-helpers";

/**
 * GET /api/admin/tables
 * List all tables for current tenant
 */
export default defineEventHandler(async (event) => {
  const session = await requirePermission(event, "VIEW_TABLES");
  const tenantId = session.user.tenantId!;

  const tables = await prisma.table.findMany({
    where: { tenantId },
    orderBy: { tableCode: "asc" },
  });

  return {
    tables,
    total: tables.length,
  };
});
