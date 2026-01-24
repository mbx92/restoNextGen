import prisma from '~/server/db/prisma'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  
  // Deactivate all existing heroes
  await prisma.landingHero.updateMany({
    where: { isActive: true },
    data: { isActive: false }
  })
  
  // Create new hero
  const hero = await prisma.landingHero.create({
    data: {
      title: body.title,
      subtitle: body.subtitle,
      description: body.description,
      ctaText: body.ctaText,
      ctaLink: body.ctaLink,
      promoText: body.promoText,
      imageUrl: body.imageUrl,
      isActive: true
    }
  })
  
  return hero
})
