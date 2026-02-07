import { requirePlatformAdmin } from "~/server/utils/platform-auth";

export default defineEventHandler(async (event) => {
  await requirePlatformAdmin(event);
  const prisma = usePrisma();

  const [totalTenants, subscriptions] = await Promise.all([
    prisma.tenant.count(),
    prisma.subscription.groupBy({
      by: ["status"],
      _count: true,
    }),
  ]);

  const activeSubscriptions =
    subscriptions.find((s) => s.status === "ACTIVE")?._count || 0;
  const trialSubscriptions =
    subscriptions.find((s) => s.status === "TRIAL")?._count || 0;

  return {
    totalTenants,
    activeSubscriptions,
    trialSubscriptions,
    monthlyRevenue: 0, // TODO: Calculate from payments
  };
});
