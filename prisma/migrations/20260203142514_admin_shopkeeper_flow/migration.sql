-- CreateTable
CREATE TABLE "AppSetting" (
    "id" TEXT NOT NULL,
    "appName" TEXT NOT NULL DEFAULT 'Inventory Cloud',
    "appDescription" TEXT NOT NULL DEFAULT 'Stock, orders, and insights',
    "maintenanceMode" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AppSetting_pkey" PRIMARY KEY ("id")
);
