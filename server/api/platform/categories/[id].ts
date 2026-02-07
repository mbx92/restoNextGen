import prisma from '~/server/db/prisma'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const method = event.method

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Category ID is required'
    })
  }

  // PATCH: Update category
  if (method === 'PATCH') {
    const body = await readBody(event)
    
    const category = await prisma.featureCategory.update({
      where: { id },
      data: {
        code: body.code,
        name: body.name,
        description: body.description,
        icon: body.icon,
        sortOrder: body.sortOrder,
        isActive: body.isActive
      }
    })
    
    return category
  }

  // DELETE: Delete category
  if (method === 'DELETE') {
    // Check if category has features
    const category = await prisma.featureCategory.findUnique({
      where: { id },
      include: {
        _count: {
          select: { features: true }
        }
      }
    })

    if (!category) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Category not found'
      })
    }

    if (category._count.features > 0) {
      throw createError({
        statusCode: 400,
        statusMessage: `Cannot delete category with ${category._count.features} features. Please reassign or delete them first.`
      })
    }

    await prisma.featureCategory.delete({
      where: { id }
    })

    return { success: true }
  }

  throw createError({
    statusCode: 405,
    statusMessage: 'Method not allowed'
  })
})
