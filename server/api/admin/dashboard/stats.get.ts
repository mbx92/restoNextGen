import prisma from "~/server/db/prisma";
import { requireUser } from "~/server/utils/auth-helpers";

/**
 * GET /api/admin/dashboard/stats
 * Get dashboard statistics based on business type
 */
export default defineEventHandler(async (event) => {
  const session = await requireUser(event);
  const tenantId = session.user.tenantId!;

  // Get tenant to determine business type
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: { businessType: true },
  });

  const businessType = tenant?.businessType || "restaurant";

  // Get today's date range for revenue calculation
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Calculate today's revenue from completed orders
  const todayOrders = await prisma.order.findMany({
    where: {
      tenantId,
      status: "COMPLETED",
      createdAt: {
        gte: today,
        lt: tomorrow,
      },
    },
    select: { total: true },
  });
  const todayRevenue = todayOrders.reduce((sum, order) => sum + order.total, 0);

  // Count total completed transactions today
  const todayTransactions = todayOrders.length;

  if (businessType === "retail") {
    // Retail-specific stats
    const [totalProducts, totalTransactions] = await Promise.all([
      prisma.menuItem.count({
        where: { tenantId, isAvailable: true },
      }),
      prisma.order.count({
        where: { tenantId, status: "COMPLETED" },
      }),
    ]);

    // TODO: Add low stock calculation when inventory/stock field is added to MenuItem
    const lowStockProducts = 0;

    return {
      businessType,
      totalProducts,
      lowStockProducts,
      todayRevenue,
      todayTransactions,
      totalTransactions,
    };
  }

  // Restaurant-specific stats (default)
  const [activeOrders, pendingReservations, activeTables] = await Promise.all([
    prisma.order.count({
      where: {
        tenantId,
        status: {
          notIn: ["COMPLETED", "CANCELLED"],
        },
      },
    }),
    prisma.reservation.count({
      where: { tenantId, status: "PENDING" },
    }),
    prisma.table.count({
      where: { tenantId, isActive: true },
    }),
  ]);

  return {
    businessType,
    activeOrders,
    pendingReservations,
    activeTables,
    todayRevenue,
    todayTransactions,
  };
});
