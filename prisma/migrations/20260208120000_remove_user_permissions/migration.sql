-- Remove unused user fields and permission flags.
ALTER TABLE "User" DROP COLUMN "emailVerified";
ALTER TABLE "User" DROP COLUMN "canAddProduct";
ALTER TABLE "User" DROP COLUMN "canEditStock";
ALTER TABLE "User" DROP COLUMN "canViewReports";
ALTER TABLE "User" DROP COLUMN "canSellProduct";
ALTER TABLE "User" DROP COLUMN "canViewOnly";
