import type { H3Event } from "h3";
import { getTenantId } from "./tenant";

/**
 * Plan limits interface
 */
export interface PlanLimits {
  menuItems: number;
  tables: number;
  orders: number;
  users: number;
  storage: number; // in MB
  locations: number;
}

/**
 * Get tenant's active plan with limits
 */
export async function getTenantPlan(event: H3Event) {
  const tenantId = await getTenantId(event);

  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    include: {
      subscription: {
        include: {
          planRelation: true,
        },
      },
    },
  });

  if (!tenant) {
    throw createError({
      statusCode: 404,
      statusMessage: "Tenant not found",
    });
  }

  // Get plan from subscription, fallback to free plan
  const plan =
    tenant.subscription?.planRelation ||
    (await prisma.plan.findFirst({
      where: { slug: "free" },
    }));

  if (!plan) {
    throw createError({
      statusCode: 500,
      statusMessage: "No plan found for tenant",
    });
  }

  return {
    plan,
    limits: plan.limits as PlanLimits,
    subscriptionStatus: tenant.subscription?.status || "TRIAL",
  };
}

/**
 * Check if tenant can create more resources of a specific type
 * @param event H3Event
 * @param resourceType Type of resource (menuItems, tables, orders, etc)
 * @returns true if can create, throws error if limit exceeded
 */
export async function checkResourceLimit(
  event: H3Event,
  resourceType: keyof PlanLimits,
): Promise<boolean> {
  const tenantId = await getTenantId(event);
  const { limits } = await getTenantPlan(event);

  const limit = limits[resourceType];

  // -1 means unlimited
  if (limit === -1) {
    return true;
  }

  // Count current usage based on resource type
  let currentCount = 0;

  switch (resourceType) {
    case "menuItems":
      currentCount = await prisma.menuItem.count({
        where: { tenantId },
      });
      break;
    case "tables":
      currentCount = await prisma.table.count({
        where: { tenantId },
      });
      break;
    case "orders":
      // Count orders in current month (to avoid unbounded growth)
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      currentCount = await prisma.order.count({
        where: {
          tenantId,
          createdAt: { gte: startOfMonth },
        },
      });
      break;
    case "users":
      currentCount = await prisma.user.count({
        where: { tenantId },
      });
      break;
    case "locations":
      // Currently single location, placeholder for future
      currentCount = 1;
      break;
    case "storage":
      // TODO: Implement storage calculation
      currentCount = 0;
      break;
  }

  if (currentCount >= limit) {
    throw createError({
      statusCode: 403,
      statusMessage: `Plan limit exceeded: You can only have ${limit} ${resourceType}. Please upgrade your plan.`,
    });
  }

  return true;
}

/**
 * Check if a feature is available for the tenant's plan
 * Supports tenant-level overrides and plan-level feature flags
 * @param event H3Event
 * @param featureCode Feature code (e.g., "CUSTOM_DOMAIN", "ADVANCED_ANALYTICS")
 * @returns true if feature is available
 */
export async function hasFeature(
  event: H3Event,
  featureCode: string,
): Promise<boolean> {
  const tenantId = await getTenantId(event);
  const { plan } = await getTenantPlan(event);

  // 1. Check tenant-specific override first (highest priority)
  const override = await prisma.tenantFeatureOverride.findUnique({
    where: {
      tenantId_featureId: {
        tenantId,
        featureId: featureCode,
      },
    },
  });

  if (override) {
    return override.enabled;
  }

  // 2. Check plan-feature mapping (normalized)
  const planFeature = await prisma.planFeature.findFirst({
    where: {
      planId: plan.id,
      feature: {
        code: featureCode,
      },
      enabled: true,
    },
  });

  if (planFeature) {
    return true;
  }

  // 3. Fallback to legacy JSON features array (backward compatibility)
  const features = plan.features as string[];
  if (Array.isArray(features)) {
    return features.includes(featureCode);
  }

  return false;
}

/**
 * Get all enabled features for the tenant
 * Combines plan features and tenant overrides
 * @param event H3Event
 * @returns Object with feature codes as keys and enabled status as values
 */
export async function getTenantFeatures(event: H3Event) {
  const tenantId = await getTenantId(event);
  const { plan } = await getTenantPlan(event);

  // Get all plan features
  const planFeatures = await prisma.planFeature.findMany({
    where: {
      planId: plan.id,
    },
    include: {
      feature: true,
    },
  });

  // Get tenant overrides
  const overrides = await prisma.tenantFeatureOverride.findMany({
    where: {
      tenantId,
    },
    include: {
      feature: true,
    },
  });

  // Build feature map
  const features: Record<string, boolean> = {};

  // Start with plan features
  planFeatures.forEach((pf) => {
    features[pf.feature.code] = pf.enabled;
  });

  // Apply overrides
  overrides.forEach((ov) => {
    features[ov.feature.code] = ov.enabled;
  });

  // Fallback: include legacy JSON features if they exist
  const legacyFeatures = plan.features as string[];
  if (Array.isArray(legacyFeatures)) {
    legacyFeatures.forEach((f) => {
      if (!(f in features)) {
        features[f] = true;
      }
    });
  }

  return features;
}

/**
 * Get current usage stats for tenant
 */
export async function getTenantUsage(event: H3Event) {
  const tenantId = await getTenantId(event);
  const { limits } = await getTenantPlan(event);

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [menuItemsCount, tablesCount, ordersCount, usersCount] =
    await Promise.all([
      prisma.menuItem.count({ where: { tenantId } }),
      prisma.table.count({ where: { tenantId } }),
      prisma.order.count({
        where: { tenantId, createdAt: { gte: startOfMonth } },
      }),
      prisma.user.count({ where: { tenantId } }),
    ]);

  return {
    menuItems: { current: menuItemsCount, limit: limits.menuItems },
    tables: { current: tablesCount, limit: limits.tables },
    orders: { current: ordersCount, limit: limits.orders },
    users: { current: usersCount, limit: limits.users },
    storage: { current: 0, limit: limits.storage }, // TODO
    locations: { current: 1, limit: limits.locations },
  };
}
