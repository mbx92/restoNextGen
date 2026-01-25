export default defineEventHandler(async (event) => {
  const tenantId = await getTenantId(event);
  const prisma = usePrisma();

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
    activeOrders,
    pendingReservations,
    activeTables,
    todayRevenue: 0, // TODO: Calculate from payments
  };
});
