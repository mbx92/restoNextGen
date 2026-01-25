import { z } from "zod";

const categorySchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  sortOrder: z.number().optional(),
  isActive: z.boolean().optional(),
});

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const data = categorySchema.parse(body);

  const prisma = usePrisma();

  const category = await prisma.category.create({
    data: {
      name: data.name,
      slug: data.slug,
      sortOrder: data.sortOrder ?? 0,
      isActive: data.isActive ?? true,
    },
  });

  return category;
});
