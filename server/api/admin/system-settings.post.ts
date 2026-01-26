import prisma from "~/server/db/prisma";
import { getTenantId } from "~/server/utils/tenant";

export default defineEventHandler(async (event) => {
  const tenantId = await getTenantId(event);
  const body = await readBody(event);

  const settings = await prisma.systemSettings.upsert({
    where: { tenantId },
    update: {
      enableTax: body.enableTax,
      taxRate: body.taxRate,
      taxName: body.taxName,
      currency: body.currency,
      timezone: body.timezone,
      enableInventoryTracking: body.enableInventoryTracking,
      lowStockThreshold: body.lowStockThreshold,
      enableReservations: body.enableReservations,
      enableOnlineOrdering: body.enableOnlineOrdering,
    },
    create: {
      tenantId,
      enableTax: body.enableTax,
      taxRate: body.taxRate,
      taxName: body.taxName,
      currency: body.currency,
      timezone: body.timezone,
      enableInventoryTracking: body.enableInventoryTracking,
      lowStockThreshold: body.lowStockThreshold,
      enableReservations: body.enableReservations,
      enableOnlineOrdering: body.enableOnlineOrdering,
    },
  });

  return settings;
});
