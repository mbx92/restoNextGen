import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const orders = await prisma.order.findMany({
    include: { items: true, payments: true },
  });
  console.log("Total Orders:", orders.length);
  console.log(JSON.stringify(orders.slice(0, 3), null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
