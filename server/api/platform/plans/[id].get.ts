import { requirePlatformAdmin } from "~/server/utils/platform-auth";

/**
 * GET /api/platform/plans/:id
 * Get single plan by ID
 */
export default defineEventHandler(async (event) => {
  await requirePlatformAdmin(event);
  const prisma = usePrisma();
  const planId = getRouterParam(event, "id");

  if (!planId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Plan ID is required",
    });
  }

  const plan = await prisma.plan.findUnique({
    where: { id: planId },
    include: {
      _count: {
        select: {
          subscriptions: true,
        },
      },
      subscriptions: {
        include: {
          tenant: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
        take: 10,
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!plan) {
    throw createError({
      statusCode: 404,
      statusMessage: "Plan not found",
    });
  }

  return plan;
});
