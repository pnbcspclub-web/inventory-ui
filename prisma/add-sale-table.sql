CREATE TABLE IF NOT EXISTS `Sale` (
  `id` VARCHAR(191) NOT NULL,
  `productId` VARCHAR(191) NOT NULL,
  `quantity` INT NOT NULL,
  `total` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `createdById` VARCHAR(191) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  INDEX `Sale_createdById_createdAt_idx` (`createdById`, `createdAt`),
  INDEX `Sale_productId_createdAt_idx` (`productId`, `createdAt`),
  CONSTRAINT `Sale_productId_fkey`
    FOREIGN KEY (`productId`) REFERENCES `Product`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `Sale_createdById_fkey`
    FOREIGN KEY (`createdById`) REFERENCES `User`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
);
