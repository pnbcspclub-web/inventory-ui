-- CreateIndex
CREATE INDEX "Order_createdById_createdAt_idx" ON "Order"("createdById", "createdAt");

-- CreateIndex
CREATE INDEX "Order_type_status_createdAt_idx" ON "Order"("type", "status", "createdAt");

-- CreateIndex
CREATE INDEX "Product_ownerId_quantity_idx" ON "Product"("ownerId", "quantity");

-- CreateIndex
CREATE INDEX "User_role_createdAt_idx" ON "User"("role", "createdAt");

-- CreateIndex
CREATE INDEX "User_role_shopStatus_idx" ON "User"("role", "shopStatus");

-- CreateIndex
CREATE INDEX "User_role_shopExpiry_idx" ON "User"("role", "shopExpiry");
