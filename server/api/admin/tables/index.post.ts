import prisma from '~/server/db/prisma'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  
  const table = await prisma.table.create({
    data: {
      tableCode: body.tableCode,
      name: body.name,
      capacity: body.capacity,
      isActive: body.isActive ?? true
    }
  })
  
  return table
})
