import { requirePlatformAdmin } from "~/server/utils/platform-auth";

/**
 * GET /api/platform/plans
 * Get all plans for platform admin
 */
export default defineEventHandler(async (event) => {
  await requirePlatformAdmin(event);
  const prisma = usePrisma();

  const plans = await prisma.plan.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      _count: {
        select: {
          subscriptions: true,
        },
      },
    },
  });

  return plans;
});
