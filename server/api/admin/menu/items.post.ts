import { z } from "zod";
import { checkResourceLimit } from "~/server/utils/feature-gating";

const menuItemSchema = z.object({
  categoryId: z.string().optional(),
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.number().int().positive(),
  photoUrl: z.string().optional(),
  isAvailable: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  sortOrder: z.number().optional(),
  stock: z.number().int().min(0).optional().nullable(),
  sku: z.string().optional().nullable(),
});

export default defineEventHandler(async (event) => {
  const tenantId = await getTenantId(event);

  // Check plan limit before creating
  await checkResourceLimit(event, "menuItems");

  const body = await readBody(event);
  const data = menuItemSchema.parse(body);

  const prisma = usePrisma();

  const menuItem = await prisma.menuItem.create({
    data: {
      tenantId,
      categoryId: data.categoryId || null,
      name: data.name,
      description: data.description || null,
      price: data.price,
      photoUrl: data.photoUrl || null,
      isAvailable: data.isAvailable ?? true,
      isFeatured: data.isFeatured ?? false,
      sortOrder: data.sortOrder ?? 0,
      stock: data.stock ?? null,
      sku: data.sku || null,
    },
    include: {
      category: true,
    },
  });

  return menuItem;
});
