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

const prisma = new PrismaClient();

const defaultPassword = process.env.SHOP_PASSWORD || "Password@123";

const shops = [
  {
    shopName: "Korvex Computers",
    name: "Raj Shamani",
    email: "raj.shamani@korvex-computers.example",
    userCode: "KC",
    address: "4th Floor, Orion Plaza, Pune, MH",
    phone: "+1-555-0101",
  },
  {
    shopName: "Nimbus Digital Hub",
    name: "Aarav Mehta",
    email: "aarav.mehta@nimbus-digital.example",
    userCode: "ND",
    address: "12 Galaxy Road, Ahmedabad, GJ",
    phone: "+1-555-0102",
  },
  {
    shopName: "Vertex Mobile Zone",
    name: "Kiran Rao",
    email: "kiran.rao@vertex-mobile.example",
    userCode: "VM",
    address: "88 Sunrise Arcade, Hyderabad, TS",
    phone: "+1-555-0103",
  },
  {
    shopName: "NovaTech Solutions",
    name: "Ananya Iyer",
    email: "ananya.iyer@novatech.example",
    userCode: "NS",
    address: "21 Lake View Rd, Kochi, KL",
    phone: "+1-555-0104",
  },
  {
    shopName: "Orbit IT Mart",
    name: "Rohit Verma",
    email: "rohit.verma@orbit-it.example",
    userCode: "OI",
    address: "55 Central Avenue, Jaipur, RJ",
    phone: "+1-555-0105",
  },
  {
    shopName: "Bytewave Electronics",
    name: "Priya Menon",
    email: "priya.menon@bytewave.example",
    userCode: "BE",
    address: "9 Metro Tower, Chennai, TN",
    phone: "+1-555-0106",
  },
  {
    shopName: "Axiom Computer House",
    name: "Vikram Singh",
    email: "vikram.singh@axiom-computer.example",
    userCode: "AH",
    address: "31 Business Park, Lucknow, UP",
    phone: "+1-555-0107",
  },
  {
    shopName: "Zenith Gadget World",
    name: "Neha Kapoor",
    email: "neha.kapoor@zenith-gadget.example",
    userCode: "ZG",
    address: "102 Park Street, Kolkata, WB",
    phone: "+1-555-0108",
  },
  {
    shopName: "Fusion Laptop Studio",
    name: "Arjun Das",
    email: "arjun.das@fusion-laptop.example",
    userCode: "FL",
    address: "7 City Center, Indore, MP",
    phone: "+1-555-0109",
  },
  {
    shopName: "Pioneer Systems",
    name: "Meera Joshi",
    email: "meera.joshi@pioneer-systems.example",
    userCode: "PS",
    address: "66 Lake Road, Surat, GJ",
    phone: "+1-555-0110",
  },
];

const randomExpiry = () => {
  const now = new Date();
  const days = 30 + Math.floor(Math.random() * 90);
  const expiry = new Date(now);
  expiry.setDate(now.getDate() + days);
  return expiry;
};

async function run() {
  const passwordHash = await bcrypt.hash(defaultPassword, 10);
  const results = [];

  for (const shop of shops) {
    const data = {
      name: shop.name,
      email: shop.email.toLowerCase(),
      role: "SHOPKEEPER",
      userCode: shop.userCode,
      shopName: shop.shopName,
      shopStatus: "ACTIVE",
      shopExpiry: randomExpiry(),
      address: shop.address,
      phone: shop.phone,
      passwordHash,
    };

    const user = await prisma.user.upsert({
      where: { email: data.email },
      create: data,
      update: {
        ...data,
        passwordHash,
      },
      select: {
        id: true,
        email: true,
        shopName: true,
        userCode: true,
        shopExpiry: true,
      },
    });
    results.push(user);
  }

  console.log("Created/updated shop accounts:", results);
}

run()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
