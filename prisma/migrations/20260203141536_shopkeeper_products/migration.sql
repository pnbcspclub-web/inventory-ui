/*
  Warnings:

  - A unique constraint covering the columns `[ownerId,serialNumber]` on the table `Product` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userCode]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `ownerId` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `serialNumber` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "ownerId" TEXT NOT NULL,
ADD COLUMN     "serialNumber" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "userCode" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Product_ownerId_serialNumber_key" ON "Product"("ownerId", "serialNumber");

-- CreateIndex
CREATE UNIQUE INDEX "User_userCode_key" ON "User"("userCode");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
