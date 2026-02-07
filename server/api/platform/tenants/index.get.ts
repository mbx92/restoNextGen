import { requirePlatformAdmin } from "~/server/utils/platform-auth";

export default defineEventHandler(async (event) => {
  await requirePlatformAdmin(event);
  const prisma = usePrisma();
  const query = getQuery(event);
  const limit = query.limit ? parseInt(query.limit as string) : undefined;

  const tenants = await prisma.tenant.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      subscription: true,
      _count: {
        select: {
          adminUsers: true,
        },
      },
    },
  });

  return tenants;
});
