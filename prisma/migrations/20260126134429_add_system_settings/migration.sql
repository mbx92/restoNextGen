-- CreateTable
CREATE TABLE "system_settings" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "enableTax" BOOLEAN NOT NULL DEFAULT false,
    "taxRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "taxName" TEXT NOT NULL DEFAULT 'PPN',
    "currency" TEXT NOT NULL DEFAULT 'IDR',
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Jakarta',
    "businessHours" JSONB,
    "enableInventoryTracking" BOOLEAN NOT NULL DEFAULT true,
    "lowStockThreshold" INTEGER NOT NULL DEFAULT 10,
    "enableReservations" BOOLEAN NOT NULL DEFAULT true,
    "enableOnlineOrdering" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "system_settings_tenantId_key" ON "system_settings"("tenantId");

-- CreateIndex
CREATE INDEX "system_settings_tenantId_idx" ON "system_settings"("tenantId");

-- AddForeignKey
ALTER TABLE "system_settings" ADD CONSTRAINT "system_settings_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
