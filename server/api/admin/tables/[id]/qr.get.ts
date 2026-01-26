import QRCode from "qrcode";
import { requirePermission } from "~/server/utils/auth-helpers";

/**
 * GET /api/admin/tables/[id]/qr
 * Generate QR code for table
 */
export default defineEventHandler(async (event) => {
  const session = await requirePermission(event, "VIEW_TABLES");
  const tenantId = session.user.tenantId!;

  const tableId = getRouterParam(event, "id");
  if (!tableId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Table ID is required",
    });
  }

  // Get table
  const table = await prisma.table.findFirst({
    where: {
      id: tableId,
      tenantId,
    },
    include: {
      tenant: true,
    },
  });

  if (!table) {
    throw createError({
      statusCode: 404,
      statusMessage: "Table not found",
    });
  }

  // Generate QR URL (should point to public ordering page)
  const config = useRuntimeConfig(event);
  const baseUrl = config.public.siteUrl || "http://localhost:3000";
  const qrUrl = `${baseUrl}/order/${table.tenant.slug}?table=${table.tableCode}`;

  // Generate QR code as data URL
  const qrDataUrl = await QRCode.toDataURL(qrUrl, {
    width: 400,
    margin: 2,
    color: {
      dark: "#000000",
      light: "#FFFFFF",
    },
  });

  return {
    tableId: table.id,
    tableCode: table.tableCode,
    name: table.name,
    qrUrl,
    qrDataUrl,
  };
});
