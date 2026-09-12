/*
  Warnings:

  - You are about to drop the column `imageUrl` on the `Review` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Review"
RENAME COLUMN "imageUrl" TO "productUrl";