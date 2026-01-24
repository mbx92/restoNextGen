import prisma from '~/server/db/prisma'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const status = query.status as string | undefined
  
  const reservations = await prisma.reservation.findMany({
    where: status ? { status: status as any } : undefined,
    include: {
      table: true
    },
    orderBy: { startAt: 'desc' },
    take: 50
  })
  
  return reservations
})
