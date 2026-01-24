import prisma from '~/server/db/prisma'

export default defineEventHandler(async () => {
  const orders = await prisma.order.findMany({
    where: {
      status: {
        notIn: ['COMPLETED', 'CANCELLED']
      }
    },
    include: {
      table: true,
      items: {
        include: {
          menuItem: true
        }
      }
    },
    orderBy: { createdAt: 'asc' }
  })
  
  return orders
})
