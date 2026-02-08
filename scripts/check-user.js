const fs = require("fs");
const path = require("path");

const loadEnvFile = () => {
  const envPath = path.join(__dirname, "..", ".env");
  if (!fs.existsSync(envPath)) return;
  const content = fs.readFileSync(envPath, "utf8");
  content.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    const idx = trimmed.indexOf("=");
    if (idx === -1) return;
    const key = trimmed.slice(0, idx).trim();
    let value = trimmed.slice(idx + 1).trim();
    if (
      (value.startsWith("\"") && value.endsWith("\"")) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  });
};

loadEnvFile();
const { PrismaClient } = require("@prisma/client");

const email = process.argv[2];
const password = process.argv[3];
if (!email) {
  console.error("Usage: node scripts/check-user.js <email>");
  process.exit(1);
}

const prisma = new PrismaClient();

async function run() {
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      role: true,
      shopName: true,
      shopStatus: true,
      shopExpiry: true,
      userCode: true,
      createdAt: true,
      passwordHash: true,
    },
  });
  if (!user) {
    console.log(null);
    return;
  }
  const output = {
    ...user,
    passwordHash: user.passwordHash ? "***set***" : null,
  };
  if (password && user.passwordHash) {
    const bcrypt = require("bcryptjs");
    output.passwordMatch = await bcrypt.compare(password, user.passwordHash);
  }
  console.log(output);
}

run()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
