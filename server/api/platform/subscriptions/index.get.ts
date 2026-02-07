import { prisma } from "~/server/db/prisma";
import { requirePlatformAdmin } from "~/server/utils/platform-auth";

export default defineEventHandler(async (event) => {
  await requirePlatformAdmin(event);

  const subscriptions = await prisma.subscription.findMany({
    include: {
      tenant: {
        select: {
          id: true,
          name: true,
          slug: true,
          businessType: true,
          isActive: true,
        },
      },
      planRelation: {
        select: {
          id: true,
          name: true,
          slug: true,
          price: true,
          billingInterval: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return subscriptions;
});
