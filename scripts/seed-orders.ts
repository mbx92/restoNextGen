import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Get the first tenant
  const tenant = await prisma.tenant.findFirst();
  if (!tenant) {
    console.log("No tenant found. Please run seed first.");
    return;
  }

  // Get some products
  const products = await prisma.menuItem.findMany({
    where: { tenantId: tenant.id },
    take: 5,
  });

  if (products.length === 0) {
    console.log("No products found. Please add some products first.");
    return;
  }

  // Generate sample orders
  const orderData = [
    {
      orderNumber: "POS-20260126-001",
      type: "TAKEAWAY" as const,
      status: "COMPLETED" as const,
      customerName: "John Doe",
      customerPhone: "081234567890",
      products: products.slice(0, 2),
    },
    {
      orderNumber: "POS-20260126-002",
      type: "TAKEAWAY" as const,
      status: "COMPLETED" as const,
      customerName: "Jane Smith",
      customerPhone: "081234567891",
      products: products.slice(1, 3),
    },
    {
      orderNumber: "POS-20260126-003",
      type: "TAKEAWAY" as const,
      status: "COMPLETED" as const,
      customerName: "Bob Wilson",
      customerPhone: "081234567892",
      products: products.slice(0, 1),
    },
  ];

  for (const data of orderData) {
    // Calculate totals
    const items = data.products.map((p) => ({
      menuItemId: p.id,
      nameSnapshot: p.name,
      priceSnapshot: p.price,
      qty: Math.floor(Math.random() * 3) + 1,
      lineTotal: 0,
    }));
    items.forEach((item) => {
      item.lineTotal = item.priceSnapshot * item.qty;
    });

    const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
    const total = Math.round(subtotal * 1.11); // 11% tax

    // Create order
    const order = await prisma.order.create({
      data: {
        tenantId: tenant.id,
        orderNumber: data.orderNumber,
        type: data.type,
        status: data.status,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        subtotal,
        total,
        items: {
          create: items.map((item) => ({
            menuItemId: item.menuItemId,
            nameSnapshot: item.nameSnapshot,
            priceSnapshot: item.priceSnapshot,
            qty: item.qty,
            lineTotal: item.lineTotal,
          })),
        },
      },
    });

    // Create payment
    await prisma.payment.create({
      data: {
        tenantId: tenant.id,
        orderId: order.id,
        provider: "CASH",
        amount: total,
        currency: "IDR",
        status: "PAID",
        paidAt: new Date(),
      },
    });

    console.log(`Created order: ${order.orderNumber}`);
  }

  console.log("\n✅ Sample orders created successfully!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
