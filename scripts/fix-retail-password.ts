import { PrismaClient } from "@prisma/client";
import { hash } from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await hash("admin123", 10);

  // Check if retail admin exists
  const retailAdmin = await prisma.adminUser.findFirst({
    where: { email: "admin@tokosejahtera.com" },
  });

  if (retailAdmin) {
    // Update password
    const result = await prisma.adminUser.update({
      where: { id: retailAdmin.id },
      data: { passwordHash },
    });
    console.log("✅ Password updated for:", result.email);
  } else {
    // Find retail tenant
    const retailTenant = await prisma.tenant.findUnique({
      where: { slug: "demo-retail" },
    });

    if (retailTenant) {
      // Create admin user
      const admin = await prisma.adminUser.create({
        data: {
          tenantId: retailTenant.id,
          email: "admin@tokosejahtera.com",
          passwordHash,
          name: "Store Admin",
          role: "OWNER",
          isActive: true,
        },
      });
      console.log("✅ Admin user created:", admin.email);
    } else {
      console.log("❌ Retail tenant not found");
    }
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
  });
