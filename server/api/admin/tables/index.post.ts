import { z } from "zod";
import prisma from "~/server/db/prisma";
import { requirePermission } from "~/server/utils/auth-helpers";

const createTableSchema = z.object({
  tableCode: z.string().min(1),
  name: z.string().optional(),
  capacity: z.number().int().positive(),
  isActive: z.boolean().optional(),
});

/**
 * POST /api/admin/tables
 * Create a new table for current tenant
 */
export default defineEventHandler(async (event) => {
  const session = await requirePermission(event, "MANAGE_TABLES");
  const tenantId = session.user.tenantId!;

  const body = await readBody(event);
  const data = createTableSchema.parse(body);

  // Check if tableCode already exists
  const existing = await prisma.table.findUnique({
    where: {
      tenantId_tableCode: {
        tenantId,
        tableCode: data.tableCode,
      },
    },
  });

  if (existing) {
    throw createError({
      statusCode: 400,
      statusMessage: "Table code already exists",
    });
  }

  const table = await prisma.table.create({
    data: {
      tenantId,
      tableCode: data.tableCode,
      name: data.name,
      capacity: data.capacity,
      isActive: data.isActive ?? true,
    },
  });

  // Audit log
  await createAuditLog({
    tenantId,
    userId: session.user.id,
    action: "CREATE",
    entity: "Table",
    entityId: table.id,
    newData: table,
  });

  return {
    success: true,
    table,
  };
});
