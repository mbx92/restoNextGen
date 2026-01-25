import { checkSlugAvailability } from "~/server/services/tenant-provisioning";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const slug = query.slug as string;

  if (!slug) {
    throw createError({
      statusCode: 400,
      message: "Slug is required",
    });
  }

  return await checkSlugAvailability(slug);
});
