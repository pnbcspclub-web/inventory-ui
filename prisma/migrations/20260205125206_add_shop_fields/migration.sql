-- CreateEnum
CREATE TYPE "ProductStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SOLD');

-- CreateEnum
CREATE TYPE "ShopStatus" AS ENUM ('ACTIVE', 'SUSPENDED');

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "status" "ProductStatus" NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "address" TEXT,
ADD COLUMN     "canAddProduct" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "canEditStock" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "canSellProduct" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "canViewOnly" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "canViewReports" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "shopExpiry" TIMESTAMP(3),
ADD COLUMN     "shopName" TEXT,
ADD COLUMN     "shopStatus" "ShopStatus" NOT NULL DEFAULT 'ACTIVE';
