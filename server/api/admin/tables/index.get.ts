import prisma from '~/server/db/prisma'

export default defineEventHandler(async () => {
  const tables = await prisma.table.findMany({
    orderBy: { name: 'asc' }
  })
  return tables
})
