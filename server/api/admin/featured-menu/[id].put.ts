import { z } from "zod";

const updateSchema = z.object({
  menuItemId: z.string().optional(),
  name: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  price: z.number().positive().optional(),
  imageUrl: z.string().url().optional(),
  sortOrder: z.number().optional(),
  isActive: z.boolean().optional(),
});

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  if (!id) {
    throw createError({
      statusCode: 400,
      message: "Featured menu ID required",
    });
  }

  const body = await readBody(event);
  const data = updateSchema.parse(body);

  const prisma = usePrisma();

  const item = await prisma.featuredMenuItem.update({
    where: { id },
    data,
  });

  return item;
});
