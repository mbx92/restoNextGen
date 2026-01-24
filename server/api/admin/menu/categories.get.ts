import prisma from '~/server/db/prisma'

export default defineEventHandler(async () => {
  const categories = await prisma.category.findMany({
    include: {
      _count: {
        select: { items: true }
      }
    },
    orderBy: { sortOrder: 'asc' }
  })
  return categories
})
