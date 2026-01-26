import { requirePermission } from "~/server/utils/auth-helpers";

/**
 * DELETE /api/admin/tables/[id]
 * Delete a table
 */
export default defineEventHandler(async (event) => {
  const session = await requirePermission(event, "MANAGE_TABLES");
  const tenantId = session.user.tenantId!;

  const tableId = getRouterParam(event, "id");
  if (!tableId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Table ID is required",
    });
  }

  // Check if table exists and belongs to tenant
  const existingTable = await prisma.table.findFirst({
    where: {
      id: tableId,
      tenantId,
    },
  });

  if (!existingTable) {
    throw createError({
      statusCode: 404,
      statusMessage: "Table not found",
    });
  }

  // Check if table has active orders or reservations
  const hasActiveOrders = await prisma.order.findFirst({
    where: {
      tableId,
      status: {
        in: ["PLACED", "ACCEPTED", "IN_KITCHEN", "READY"],
      },
    },
  });

  if (hasActiveOrders) {
    throw createError({
      statusCode: 400,
      statusMessage: "Cannot delete table with active orders",
    });
  }

  await prisma.table.delete({
    where: { id: tableId },
  });

  // Audit log
  await createAuditLog({
    tenantId,
    userId: session.user.id,
    action: "DELETE",
    entity: "Table",
    entityId: tableId,
    oldData: existingTable,
  });

  return {
    success: true,
    message: "Table deleted successfully",
  };
});
