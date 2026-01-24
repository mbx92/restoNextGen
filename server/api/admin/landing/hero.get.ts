import prisma from '~/server/db/prisma'

export default defineEventHandler(async () => {
  const heroes = await prisma.landingHero.findMany({
    orderBy: { createdAt: 'desc' }
  })
  return heroes
})
