import prisma from '~/server/db/prisma'

export default defineEventHandler(async () => {
  const [activeOrders, pendingReservations, activeTables] = await Promise.all([
    prisma.order.count({
      where: {
        status: {
          notIn: ['COMPLETED', 'CANCELLED']
        }
      }
    }),
    prisma.reservation.count({
      where: { status: 'PENDING' }
    }),
    prisma.table.count({
      where: { isActive: true }
    })
  ])

  return {
    activeOrders,
    pendingReservations,
    activeTables,
    todayRevenue: 0 // TODO: Calculate from payments
  }
})
