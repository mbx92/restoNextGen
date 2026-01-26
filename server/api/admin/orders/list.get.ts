import prisma from "~/server/db/prisma";
import { getTenantId } from "~/server/utils/tenant";

export default defineEventHandler(async (event) => {
  const tenantId = await getTenantId(event);

  const orders = await prisma.order.findMany({
    where: { tenantId },
    include: {
      items: {
        select: {
          nameSnapshot: true,
          priceSnapshot: true,
          qty: true,
          lineTotal: true,
          notes: true,
        },
      },
      payments: {
        select: {
          id: true,
          amount: true,
          status: true,
          provider: true,
          paidAt: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return orders;
});
