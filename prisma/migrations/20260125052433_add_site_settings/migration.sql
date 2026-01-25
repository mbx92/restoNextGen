/*
  Warnings:

  - You are about to drop the column `gmapsUrl` on the `RestaurantInfo` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `RestaurantInfo` table. All the data in the column will be lost.
  - Added the required column `phoneNumber` to the `RestaurantInfo` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "RestaurantInfo" DROP COLUMN "gmapsUrl",
DROP COLUMN "phone",
ADD COLUMN     "mapsEmbedUrl" TEXT,
ADD COLUMN     "mapsUrl" TEXT,
ADD COLUMN     "phoneNumber" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "SiteSettings" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "logoUrl" TEXT,
    "logoText" TEXT,
    "facebookUrl" TEXT,
    "instagramUrl" TEXT,
    "twitterUrl" TEXT,
    "copyrightText" TEXT,
    "footerLinks" JSONB,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SiteSettings_key_key" ON "SiteSettings"("key");

-- CreateIndex
CREATE INDEX "SiteSettings_key_idx" ON "SiteSettings"("key");
