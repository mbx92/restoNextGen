import prisma from '~/server/db/prisma'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  
  const item = await prisma.featuredMenuItem.create({
    data: {
      name: body.name,
      description: body.description,
      price: body.price,
      imageUrl: body.imageUrl,
      menuItemId: body.menuItemId,
      sortOrder: body.sortOrder || 0,
      isActive: body.isActive ?? true
    }
  })
  
  return item
})
