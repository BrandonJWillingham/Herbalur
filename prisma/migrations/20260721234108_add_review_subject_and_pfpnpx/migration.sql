/*
  Warnings:

  - Added the required column `pfpUrl` to the `Review` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subject` to the `Review` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Review" ADD COLUMN     "pfpUrl" TEXT NOT NULL,
ADD COLUMN     "subject" TEXT NOT NULL;
