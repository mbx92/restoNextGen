import { z } from "zod";

const menuItemSchema = z.object({
  categoryId: z.string().optional(),
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.number().int().positive(),
  photoUrl: z.string().optional(),
  isAvailable: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  sortOrder: z.number().optional(),
});

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const data = menuItemSchema.parse(body);

  const prisma = usePrisma();

  const menuItem = await prisma.menuItem.create({
    data: {
      categoryId: data.categoryId || null,
      name: data.name,
      description: data.description || null,
      price: data.price,
      photoUrl: data.photoUrl || null,
      isAvailable: data.isAvailable ?? true,
      isFeatured: data.isFeatured ?? false,
      sortOrder: data.sortOrder ?? 0,
    },
    include: {
      category: true,
    },
  });

  return menuItem;
});
