const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
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

const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;
const name = process.env.ADMIN_NAME || "Admin";

if (!email || !password) {
  console.error("Missing ADMIN_EMAIL or ADMIN_PASSWORD.");
  process.exit(1);
}

const prisma = new PrismaClient();

async function run() {
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.upsert({
    where: { email: email.toLowerCase() },
    create: {
      name,
      email: email.toLowerCase(),
      role: "ADMIN",
      passwordHash,
      shopStatus: "ACTIVE",
    },
    update: {
      name,
      role: "ADMIN",
      passwordHash,
      shopStatus: "ACTIVE",
    },
    select: { id: true, email: true, role: true, name: true },
  });
  console.log("Admin user ready:", user);
}

run()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
