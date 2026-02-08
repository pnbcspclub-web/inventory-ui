const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

const randomSuffix = () => Math.random().toString(36).slice(2, 8).toUpperCase();
const makeUserCode = () => `S${Math.floor(Math.random() * 900 + 100)}`;

async function run() {
  const suffix = randomSuffix();
  const email = `shop_${suffix.toLowerCase()}@example.com`;
  const password = `Test@${suffix}`;
  const passwordHash = await bcrypt.hash(password, 10);
  const userCode = makeUserCode();

  console.log("Creating shopkeeper:", email, userCode);

  const created = await prisma.user.create({
    data: {
      name: `Owner ${suffix}`,
      email,
      role: "SHOPKEEPER",
      userCode,
      shopName: `Shop ${suffix}`,
      shopStatus: "ACTIVE",
      shopExpiry: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
      address: "Test address",
      phone: "9999999999",
      canAddProduct: true,
      canEditStock: true,
      canViewReports: true,
      canSellProduct: true,
      canViewOnly: false,
      passwordHash,
    },
    select: { id: true, email: true, shopName: true, shopStatus: true },
  });

  console.log("Created:", created);

  const found = await prisma.user.findUnique({
    where: { id: created.id },
    select: { id: true, email: true, shopName: true, shopStatus: true },
  });
  console.log("Read:", found);

  const updated = await prisma.user.update({
    where: { id: created.id },
    data: { shopStatus: "SUSPENDED", shopName: `Shop ${suffix} Updated` },
    select: { id: true, shopName: true, shopStatus: true },
  });
  console.log("Updated:", updated);

  const deleted = await prisma.user.delete({
    where: { id: created.id },
    select: { id: true, email: true },
  });
  console.log("Deleted:", deleted);

  console.log("Admin CRUD test completed successfully.");
}

run()
  .catch((error) => {
    console.error("Admin CRUD test failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
