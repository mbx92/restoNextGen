import { z } from "zod";

/**
 * Platform Admin API - Assign/remove features to/from a plan
 * POST /api/platform/plans/[planId]/features
 *
 * Body:
 * {
 *   "features": [
 *     { "featureId": "xxx", "enabled": true },
 *     { "featureId": "yyy", "enabled": false }
 *   ]
 * }
 */

const assignFeaturesSchema = z.object({
  features: z.array(
    z.object({
      featureId: z.string(),
      enabled: z.boolean(),
    }),
  ),
});

export default defineEventHandler(async (event) => {
  // TODO: Add platform admin auth check
  // const platformAdmin = await getPlatformAdmin(event);

  const planId = getRouterParam(event, "planId");
  if (!planId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Plan ID is required",
    });
  }

  // Verify plan exists
  const plan = await prisma.plan.findUnique({ where: { id: planId } });
  if (!plan) {
    throw createError({
      statusCode: 404,
      statusMessage: "Plan not found",
    });
  }

  const body = await readBody(event);
  const data = assignFeaturesSchema.parse(body);

  // Upsert all plan features
  const results = await Promise.all(
    data.features.map((f) =>
      prisma.planFeature.upsert({
        where: {
          planId_featureId: {
            planId,
            featureId: f.featureId,
          },
        },
        update: { enabled: f.enabled },
        create: {
          planId,
          featureId: f.featureId,
          enabled: f.enabled,
        },
      }),
    ),
  );

  return {
    success: true,
    updated: results.length,
  };
});
