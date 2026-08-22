/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `UserData` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "UserData" ADD COLUMN     "userId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "UserData_userId_key" ON "UserData"("userId");

-- AddForeignKey
ALTER TABLE "UserData" ADD CONSTRAINT "UserData_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
