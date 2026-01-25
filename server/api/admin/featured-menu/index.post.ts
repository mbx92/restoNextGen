import { z } from "zod";

const createSchema = z.object({
  menuItemId: z.string().optional(),
  name: z.string().min(1),
  description: z.string().min(1),
  price: z.number().positive(),
  imageUrl: z.string().url(),
  sortOrder: z.number().default(0),
  isActive: z.boolean().default(true),
});

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const validated = createSchema.parse(body);

  const prisma = usePrisma();
  const item = await prisma.featuredMenuItem.create({
    data: {
      name: validated.name,
      description: validated.description,
      price: validated.price,
      imageUrl: validated.imageUrl,
      menuItemId: validated.menuItemId,
      sortOrder: validated.sortOrder || 0,
      isActive: validated.isActive ?? true,
    },
  });

  return item;
});
