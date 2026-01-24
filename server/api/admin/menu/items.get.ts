import prisma from '~/server/db/prisma'

export default defineEventHandler(async () => {
  const items = await prisma.menuItem.findMany({
    include: {
      category: true
    },
    orderBy: { sortOrder: 'asc' }
  })
  return items
})
