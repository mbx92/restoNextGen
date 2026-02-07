import { z } from "zod";

/**
 * Platform Admin API - Set tenant feature override
 * POST /api/platform/tenants/[tenantId]/features
 *
 * Body:
 * {
 *   "featureId": "CUSTOM_DOMAIN",
 *   "enabled": true,
 *   "reason": "Special enterprise customer"
 * }
 */

const setOverrideSchema = z.object({
  featureId: z.string(),
  enabled: z.boolean(),
  reason: z.string().optional(),
});

export default defineEventHandler(async (event) => {
  // TODO: Add platform admin auth check
  // const platformAdmin = await getPlatformAdmin(event);

  const tenantId = getRouterParam(event, "tenantId");
  if (!tenantId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Tenant ID is required",
    });
  }

  // Verify tenant exists
  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
  if (!tenant) {
    throw createError({
      statusCode: 404,
      statusMessage: "Tenant not found",
    });
  }

  const body = await readBody(event);
  const data = setOverrideSchema.parse(body);

  // Verify feature exists
  const feature = await prisma.feature.findUnique({
    where: { id: data.featureId },
  });
  if (!feature) {
    throw createError({
      statusCode: 404,
      statusMessage: "Feature not found",
    });
  }

  const override = await prisma.tenantFeatureOverride.upsert({
    where: {
      tenantId_featureId: {
        tenantId,
        featureId: data.featureId,
      },
    },
    update: {
      enabled: data.enabled,
      reason: data.reason,
    },
    create: {
      tenantId,
      featureId: data.featureId,
      enabled: data.enabled,
      reason: data.reason,
    },
  });

  return override;
});
