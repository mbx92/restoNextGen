import prisma from '~/server/db/prisma'

export default defineEventHandler(async (event) => {
  const method = event.method

  // GET: List all categories
  if (method === 'GET') {
    const categories = await prisma.featureCategory.findMany({
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: {
          select: { features: true }
        }
      }
    })
    return categories
  }

  // POST: Create new category
  if (method === 'POST') {
    const body = await readBody(event)
    
    const category = await prisma.featureCategory.create({
      data: {
        code: body.code,
        name: body.name,
        description: body.description,
        icon: body.icon,
        sortOrder: body.sortOrder || 0,
        isActive: body.isActive !== false
      }
    })
    
    return category
  }

  throw createError({
    statusCode: 405,
    statusMessage: 'Method not allowed'
  })
})
