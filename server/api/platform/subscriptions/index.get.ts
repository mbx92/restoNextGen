import { prisma } from "~/server/db/prisma";

export default defineEventHandler(async (_event) => {
  // Authentication is handled by platform-auth middleware
  // This endpoint is only accessible to platform admins

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
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return subscriptions;
});
