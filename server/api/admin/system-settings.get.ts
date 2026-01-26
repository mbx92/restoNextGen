import prisma from "~/server/db/prisma";
import { getTenantId } from "~/server/utils/tenant";

export default defineEventHandler(async (event) => {
  const tenantId = await getTenantId(event);

  const settings = await prisma.systemSettings.findUnique({
    where: { tenantId },
  });

  return settings;
});
