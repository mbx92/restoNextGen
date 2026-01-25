import { z } from "zod";
import type { H3Event } from "h3";
import { provisionTenant } from "~/server/services/tenant-provisioning";

const signupSchema = z.object({
  slug: z
    .string()
    .min(3)
    .max(50)
    .regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
  name: z.string().min(3).max(100),
  businessType: z.string(),
  ownerEmail: z.string().email(),
  ownerName: z.string().min(2).max(100),
  ownerPassword: z.string().min(8),
});

export default defineEventHandler(async (event: H3Event) => {
  const body = await readBody(event);

  // Validate input
  const validationResult = signupSchema.safeParse(body);
  if (!validationResult.success) {
    throw createError({
      statusCode: 400,
      message: "Validation failed",
      data: validationResult.error.issues,
    });
  }

  const data = validationResult.data;

  // Provision tenant
  const result = await provisionTenant({
    slug: data.slug,
    name: data.name,
    businessType: data.businessType,
    ownerEmail: data.ownerEmail,
    ownerName: data.ownerName,
    ownerPassword: data.ownerPassword,
    plan: "free",
  });

  if (!result.success) {
    throw createError({
      statusCode: 400,
      message: result.error || "Failed to create tenant",
    });
  }

  return {
    success: true,
    tenant: {
      id: result.tenantId,
      slug: result.slug,
    },
  };
});
