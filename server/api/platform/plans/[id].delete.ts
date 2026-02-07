import { requirePlatformAdmin } from "~/server/utils/platform-auth";

/**
 * DELETE /api/platform/plans/:id
 * Delete a plan (only if no active subscriptions)
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

  // Check if plan has active subscriptions
  const subscriptionCount = await prisma.subscription.count({
    where: {
      planId,
      status: { in: ["TRIAL", "ACTIVE"] },
    },
  });

  if (subscriptionCount > 0) {
    throw createError({
      statusCode: 400,
      statusMessage: `Cannot delete plan with ${subscriptionCount} active subscriptions. Deactivate it instead.`,
    });
  }

  await prisma.plan.delete({
    where: { id: planId },
  });

  return { success: true };
});
