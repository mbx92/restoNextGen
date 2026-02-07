-- AlterTable
ALTER TABLE "system_settings" ADD COLUMN     "autoPrintReceipt" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "enablePrinter" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "printerIpAddress" TEXT,
ADD COLUMN     "printerPort" INTEGER NOT NULL DEFAULT 9100,
ADD COLUMN     "printerType" TEXT NOT NULL DEFAULT 'EPSON_TM_T82';
