import prisma from "~/server/db/prisma";
import { getTenantId } from "~/server/utils/tenant";

interface OrderItemInput {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
}

interface CreateOrderBody {
  orderNumber: string;
  type: "DINE_IN" | "TAKEAWAY";
  tableId?: string;
  customerName?: string;
  customerPhone?: string;
  notes?: string;
  items: OrderItemInput[];
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: "cash" | "card" | "qris";
  cashReceived?: number;
}

export default defineEventHandler(async (event) => {
  const tenantId = await getTenantId(event);
  const body = await readBody<CreateOrderBody>(event);

  // Validate required fields
  if (!body.orderNumber || !body.type || !body.items || body.items.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: "Order number, type, and items are required",
    });
  }

  // Create order with items and payment in a transaction
  const order = await prisma.$transaction(async (tx) => {
    // Create the order
    const newOrder = await tx.order.create({
      data: {
        tenantId,
        orderNumber: body.orderNumber,
        type: body.type,
        status: "COMPLETED", // POS orders are immediately completed
        tableId: body.tableId || null,
        customerName: body.customerName || null,
        customerPhone: body.customerPhone || null,
        notes: body.notes || null,
        subtotal: body.subtotal,
        total: body.total,
        items: {
          create: body.items.map((item) => ({
            menuItemId: item.menuItemId,
            nameSnapshot: item.name,
            priceSnapshot: item.price,
            qty: item.quantity,
            notes: item.notes || null,
            lineTotal: item.price * item.quantity,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    // Determine payment provider based on payment method
    const provider = body.paymentMethod === "cash" ? "CASH" : "MIDTRANS";

    // Create payment record (marked as PAID for cash)
    await tx.payment.create({
      data: {
        tenantId,
        orderId: newOrder.id,
        provider,
        amount: body.total,
        currency: "IDR",
        status: body.paymentMethod === "cash" ? "PAID" : "PENDING",
        paidAt: body.paymentMethod === "cash" ? new Date() : null,
      },
    });

    return newOrder;
  });

  return {
    success: true,
    order: {
      id: order.id,
      orderNumber: order.orderNumber,
      total: order.total,
    },
  };
});
