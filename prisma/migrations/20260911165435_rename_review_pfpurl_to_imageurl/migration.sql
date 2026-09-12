/*
  Warnings:

  - You are about to drop the column `pfpUrl` on the `Review` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Review"
RENAME COLUMN "pfpUrl" TO "imageUrl";

-- CreateTable
CREATE TABLE "ShippingLabel" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "shippoTransactionId" TEXT NOT NULL,
    "labelUrl" TEXT NOT NULL,
    "trackingNumber" TEXT,
    "trackingUrl" TEXT,
    "carrier" TEXT,
    "serviceLevel" TEXT,
    "shippingCost" INTEGER,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShippingLabel_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ShippingLabel_orderId_key" ON "ShippingLabel"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "ShippingLabel_shippoTransactionId_key" ON "ShippingLabel"("shippoTransactionId");

-- AddForeignKey
ALTER TABLE "ShippingLabel" ADD CONSTRAINT "ShippingLabel_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
