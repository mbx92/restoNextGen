import prisma from "~/server/db/prisma";
import { requireUser } from "~/server/utils/auth-helpers";

/**
 * GET /api/admin/orders/queue
 * Get active orders queue
 */
export default defineEventHandler(async (event) => {
  const session = await requireUser(event);
  const tenantId = session.user.tenantId!;

  const orders = await prisma.order.findMany({
    where: {
      tenantId,
      status: {
        notIn: ["COMPLETED", "CANCELLED"],
      },
    },
    include: {
      table: true,
      items: {
        include: {
          menuItem: true,
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return orders;
});
