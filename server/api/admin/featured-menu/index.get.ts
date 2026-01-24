import prisma from '~/server/db/prisma'

export default defineEventHandler(async () => {
  const items = await prisma.featuredMenuItem.findMany({
    orderBy: { sortOrder: 'asc' }
  })
  return items
})
