import prisma from "~/server/db/prisma";
import { getTenantId } from "~/server/utils/tenant";

export default defineEventHandler(async (event) => {
  const tenantId = await getTenantId(event);

  const campaigns = await prisma.campaign.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
  });

  return campaigns;
});
