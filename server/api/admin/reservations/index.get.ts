import prisma from "~/server/db/prisma";
import { requireUser } from "~/server/utils/auth-helpers";

/**
 * GET /api/admin/reservations
 * Get reservations list with optional status filter
 */
export default defineEventHandler(async (event) => {
  const session = await requireUser(event);
  const tenantId = session.user.tenantId!;

  const query = getQuery(event);
  const status = query.status as string | undefined;

  const where: any = { tenantId };
  if (status) {
    where.status = status;
  }

  const reservations = await prisma.reservation.findMany({
    where,
    include: {
      table: true,
    },
    orderBy: { startAt: "desc" },
    take: 50,
  });

  return reservations;
});
