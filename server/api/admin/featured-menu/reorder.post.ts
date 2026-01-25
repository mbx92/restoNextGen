import { z } from "zod";

const reorderSchema = z.object({
  items: z.array(
    z.object({
      id: z.string(),
      sortOrder: z.number().int(),
    }),
  ),
});

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { items } = reorderSchema.parse(body);

  const prisma = usePrisma();

  // Update all items in a transaction
  await prisma.$transaction(
    items.map((item) =>
      prisma.featuredMenuItem.update({
        where: { id: item.id },
        data: { sortOrder: item.sortOrder },
      }),
    ),
  );

  return { success: true };
});
