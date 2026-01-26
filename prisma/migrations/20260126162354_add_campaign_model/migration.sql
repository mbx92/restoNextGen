-- CreateEnum
CREATE TYPE "CampaignType" AS ENUM ('DISCOUNT', 'POINTS', 'BUNDLE', 'FLASH_SALE');

-- CreateEnum
CREATE TYPE "CampaignStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'ACTIVE', 'ENDED');

-- AlterTable
ALTER TABLE "landing_hero" ADD COLUMN     "campaignId" TEXT;

-- CreateTable
CREATE TABLE "campaign" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "CampaignType" NOT NULL,
    "status" "CampaignStatus" NOT NULL DEFAULT 'DRAFT',
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "discount" INTEGER,
    "targetAudience" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "campaign_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "campaign_tenantId_idx" ON "campaign"("tenantId");

-- CreateIndex
CREATE INDEX "campaign_status_idx" ON "campaign"("status");

-- CreateIndex
CREATE INDEX "campaign_startDate_idx" ON "campaign"("startDate");

-- CreateIndex
CREATE INDEX "campaign_endDate_idx" ON "campaign"("endDate");

-- CreateIndex
CREATE INDEX "landing_hero_campaignId_idx" ON "landing_hero"("campaignId");

-- AddForeignKey
ALTER TABLE "campaign" ADD CONSTRAINT "campaign_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "landing_hero" ADD CONSTRAINT "landing_hero_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "campaign"("id") ON DELETE SET NULL ON UPDATE CASCADE;
