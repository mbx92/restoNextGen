import { z } from "zod";
import { requirePermission } from "~/server/utils/auth-helpers";

const updateTableSchema = z.object({
  tableCode: z.string().min(1).optional(),
  name: z.string().optional(),
  capacity: z.number().int().positive().optional(),
  isActive: z.boolean().optional(),
});

/**
 * PATCH /api/admin/tables/[id]
 * Update a table
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

  const body = await readBody(event);
  const data = updateTableSchema.parse(body);

  // If updating tableCode, check uniqueness
  if (data.tableCode && data.tableCode !== existingTable.tableCode) {
    const codeExists = await prisma.table.findUnique({
      where: {
        tenantId_tableCode: {
          tenantId,
          tableCode: data.tableCode,
        },
      },
    });

    if (codeExists) {
      throw createError({
        statusCode: 400,
        statusMessage: "Table code already exists",
      });
    }
  }

  const table = await prisma.table.update({
    where: { id: tableId },
    data,
  });

  // Audit log
  await createAuditLog({
    tenantId,
    userId: session.user.id,
    action: "UPDATE",
    entity: "Table",
    entityId: table.id,
    oldData: existingTable,
    newData: table,
  });

  return {
    success: true,
    table,
  };
});
