import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Find retail tenant
  const retailTenant = await prisma.tenant.findUnique({
    where: { slug: "demo-retail" },
  });

  if (!retailTenant) {
    console.log("❌ Retail tenant not found");
    return;
  }

  console.log("📦 Updating retail product stock...");

  // Update stock for each product
  const stockUpdates = [
    { name: "Indomie Goreng", stock: 50, sku: "FOOD-001" },
    { name: "Aqua 600ml", stock: 30, sku: "DRINK-001" },
    { name: "Sabun Cuci Piring", stock: 5, sku: "HOME-001" },
    { name: "Masker Kesehatan", stock: 0, sku: "HEALTH-001" },
    { name: "Kabel USB Type-C", stock: 15, sku: "ELEC-001" },
  ];

  for (const update of stockUpdates) {
    const result = await prisma.menuItem.updateMany({
      where: {
        tenantId: retailTenant.id,
        name: update.name,
      },
      data: {
        stock: update.stock,
        sku: update.sku,
      },
    });

    if (result.count > 0) {
      console.log(`✅ Updated ${update.name}: stock=${update.stock}`);
    } else {
      console.log(`⚠️  Product not found: ${update.name}`);
    }
  }

  console.log("✨ Stock update complete!");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
  });
