import { z } from "zod";

const categoryUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  sortOrder: z.number().optional(),
  isActive: z.boolean().optional(),
});

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  if (!id) {
    throw createError({ statusCode: 400, message: "Category ID required" });
  }

  const body = await readBody(event);
  const data = categoryUpdateSchema.parse(body);

  const prisma = usePrisma();

  const category = await prisma.category.update({
    where: { id },
    data,
  });

  return category;
});
