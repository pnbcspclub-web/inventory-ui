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

const pickRandomItems = (items, count) => {
  const shuffled = [...items].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};

const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const randomExpiry = () => {
  const now = new Date();
  const days = randInt(45, 180);
  const expiry = new Date(now);
  expiry.setDate(now.getDate() + days);
  return expiry;
};

const computerCatalog = [
  { name: "Intel Core i5 Desktop Tower", description: "Mid-range assembled desktop for office workloads.", price: 48999 },
  { name: "AMD Ryzen 7 Gaming CPU", description: "High-performance processor for custom desktop builds.", price: 22999 },
  { name: "27-inch IPS Monitor", description: "Full HD monitor with slim bezel for workstations.", price: 12999 },
  { name: "Mechanical Gaming Keyboard", description: "RGB keyboard with tactile switches.", price: 3499 },
  { name: "Wireless Ergonomic Mouse", description: "Silent-click wireless mouse for long work sessions.", price: 1299 },
  { name: "1TB NVMe SSD", description: "Fast internal solid-state drive for system upgrades.", price: 6299 },
  { name: "16GB DDR4 RAM Kit", description: "Dual-channel memory kit for desktop upgrades.", price: 4599 },
  { name: "650W Bronze Power Supply", description: "Reliable SMPS for mid-range PC builds.", price: 3899 },
  { name: "Micro ATX Motherboard", description: "Feature-rich motherboard for Intel systems.", price: 8999 },
  { name: "Gaming Cabinet with Fans", description: "Tempered glass cabinet with preinstalled RGB fans.", price: 5599 },
  { name: "Wi-Fi 6 PCIe Adapter", description: "Internal wireless adapter for desktop computers.", price: 2199 },
  { name: "1080p USB Webcam", description: "Video conferencing webcam with built-in microphone.", price: 2499 },
  { name: "Portable 2TB External HDD", description: "USB 3.0 backup drive for files and media.", price: 5799 },
  { name: "Laser Multifunction Printer", description: "Print, scan, and copy unit for small offices.", price: 18699 },
  { name: "USB-C Docking Station", description: "Multi-port dock with HDMI, USB, and Ethernet.", price: 4999 },
  { name: "27L UPS Backup Unit", description: "Power backup for desktop and router setup.", price: 6799 },
  { name: "Full HD Projector", description: "Conference room projector with HDMI input.", price: 35999 },
  { name: "Bluetooth Conference Speaker", description: "Portable speakerphone for meeting rooms.", price: 7499 },
  { name: "2.5-inch SATA SSD 512GB", description: "Affordable SSD for laptop and desktop upgrades.", price: 3199 },
  { name: "Gigabit Ethernet Switch 8-Port", description: "Managed network switch for office setup.", price: 2899 },
  { name: "USB Wireless Keyboard Combo", description: "Keyboard and mouse bundle for desktop users.", price: 1899 },
  { name: "Noise Cancelling Headset", description: "Wired stereo headset for calls and support desks.", price: 2699 },
  { name: "Portable Barcode Scanner", description: "USB scanner for billing and inventory counters.", price: 3999 },
  { name: "Thermal Receipt Printer", description: "Compact printer for POS and billing systems.", price: 5299 },
];

const mobileCatalog = [
  { name: "5G Android Smartphone 128GB", description: "Mid-range smartphone with AMOLED display.", price: 17999 },
  { name: "Premium Flagship Smartphone 256GB", description: "High-end smartphone with fast charging.", price: 58999 },
  { name: "Budget Android Phone 64GB", description: "Entry-level handset for everyday use.", price: 8999 },
  { name: "True Wireless Earbuds", description: "Bluetooth earbuds with charging case.", price: 2499 },
  { name: "Fast Charger 33W", description: "Wall adapter with USB-C fast charging support.", price: 1199 },
  { name: "Braided Type-C Cable", description: "Durable charging cable for modern smartphones.", price: 349 },
  { name: "Power Bank 20000mAh", description: "Portable battery pack with dual output.", price: 1999 },
  { name: "Tempered Glass Guard", description: "Scratch-resistant screen protector for smartphones.", price: 199 },
  { name: "Shockproof Phone Case", description: "Protective case with raised camera bump.", price: 399 },
  { name: "Bluetooth Neckband", description: "Lightweight neckband earphones for daily commute.", price: 1499 },
  { name: "Smartwatch with AMOLED Display", description: "Fitness smartwatch with call support.", price: 3999 },
  { name: "Wireless Car Charger", description: "Dashboard charger for supported devices.", price: 1799 },
  { name: "Mobile Tripod Stand", description: "Portable stand for reels, classes, and live streams.", price: 899 },
  { name: "Ring Light 10-inch", description: "LED light for mobile content creation.", price: 1299 },
  { name: "SIM Activation Kit", description: "Retail starter pack for mobile operators.", price: 99 },
  { name: "Bluetooth Portable Speaker", description: "Compact speaker with bass boost.", price: 2299 },
  { name: "128GB microSD Card", description: "Storage expansion for phones and cameras.", price: 999 },
  { name: "Dual USB Car Adapter", description: "Fast charging adapter for in-car use.", price: 499 },
  { name: "Camera Lens Cleaner Kit", description: "Cleaning tools for phone camera maintenance.", price: 249 },
  { name: "Tablet 10.1-inch Wi-Fi", description: "Large-screen Android tablet for work and study.", price: 14499 },
  { name: "Phone Cooling Fan", description: "Clip-on cooling accessory for gaming sessions.", price: 1099 },
  { name: "Magnetic Phone Mount", description: "Dashboard mount for navigation.", price: 599 },
  { name: "Wireless Charging Pad", description: "Desk charger for compatible phones and earbuds.", price: 1299 },
  { name: "USB-C OTG Adapter", description: "Connector for pendrives and peripherals.", price: 299 },
];

const laptopCatalog = [
  { name: "14-inch Business Laptop", description: "Slim laptop for office and billing teams.", price: 52999 },
  { name: "15.6-inch Gaming Laptop", description: "High-refresh laptop with dedicated graphics.", price: 83999 },
  { name: "13-inch Ultrabook", description: "Lightweight premium laptop for executives.", price: 74999 },
  { name: "Laptop Backpack 15-inch", description: "Water-resistant backpack with padded sleeve.", price: 2199 },
  { name: "Laptop Sleeve 14-inch", description: "Neoprene protective sleeve for travel.", price: 899 },
  { name: "USB-C GaN Charger 65W", description: "Compact power adapter for modern laptops.", price: 2399 },
  { name: "Laptop Cooling Pad", description: "Dual-fan stand for improved thermal performance.", price: 1599 },
  { name: "Wireless Presentation Clicker", description: "Remote for presentations and training rooms.", price: 1499 },
  { name: "4K HDMI Cable", description: "High-speed cable for monitor and projector output.", price: 699 },
  { name: "USB-C Multiport Hub", description: "Hub with USB, HDMI, and card reader ports.", price: 2699 },
  { name: "Portable SSD 1TB", description: "High-speed external SSD for backups and editing.", price: 7999 },
  { name: "Laptop RAM 16GB DDR5", description: "Memory upgrade kit for supported notebooks.", price: 6299 },
  { name: "512GB M.2 SSD", description: "Storage upgrade for laptops and mini PCs.", price: 3599 },
  { name: "Noise Isolating Headphones", description: "Over-ear headphones for focused work.", price: 3299 },
  { name: "External DVD Writer", description: "USB optical drive for legacy media access.", price: 2499 },
  { name: "Wireless Numeric Keypad", description: "Compact keypad for accounting teams.", price: 1199 },
  { name: "Laptop Stand Aluminum", description: "Ergonomic desk stand for long work hours.", price: 1699 },
  { name: "1080p Portable Monitor", description: "Second screen for mobile work setups.", price: 12999 },
  { name: "Creator Laptop 16-inch", description: "High-memory laptop for design and editing.", price: 94999 },
  { name: "Premium Webcam 2K", description: "Sharp video camera for meetings and streaming.", price: 4499 },
  { name: "USB-C to Ethernet Adapter", description: "Stable wired internet for laptops.", price: 899 },
  { name: "Laptop Keyboard Cover", description: "Silicone cover for spill protection.", price: 399 },
  { name: "Privacy Screen 14-inch", description: "Filter for confidential work in public spaces.", price: 1799 },
  { name: "Docking Monitor Arm Combo", description: "Workspace bundle for hybrid office setups.", price: 6299 },
];

const gadgetCatalog = [
  { name: "Smart Speaker with Voice Assistant", description: "Wi-Fi speaker for home automation and music.", price: 4499 },
  { name: "Indoor Security Camera", description: "App-connected camera with motion alerts.", price: 2999 },
  { name: "Outdoor Smart CCTV Camera", description: "Weather-resistant camera with night vision.", price: 5299 },
  { name: "Smart LED Bulb", description: "Color changing bulb with app scheduling.", price: 799 },
  { name: "Smart Plug", description: "Remote control plug for appliances.", price: 899 },
  { name: "Robot Vacuum Cleaner", description: "Automatic floor cleaning unit for homes.", price: 18999 },
  { name: "Portable Party Speaker", description: "Large Bluetooth speaker with light modes.", price: 6999 },
  { name: "Wireless Home Alarm Kit", description: "DIY security kit with siren and sensors.", price: 8499 },
  { name: "Video Doorbell", description: "Smart doorbell with live mobile alerts.", price: 5999 },
  { name: "Smart TV Stick 4K", description: "Streaming stick for OTT apps and casting.", price: 3499 },
  { name: "Fitness Tracker Band", description: "Everyday health and activity wearable.", price: 2199 },
  { name: "Air Purifier Compact", description: "Desktop purifier for rooms and offices.", price: 8999 },
  { name: "Mini Projector", description: "Portable projector for entertainment and demos.", price: 14999 },
  { name: "Portable Photo Printer", description: "Instant mobile photo printer with app support.", price: 7999 },
  { name: "Wireless Gaming Controller", description: "Bluetooth controller for mobile and PC gaming.", price: 2699 },
  { name: "Action Camera 4K", description: "Water-resistant camera for travel and sports.", price: 10999 },
  { name: "Digital Drawing Tablet", description: "Graphic pad for artists and designers.", price: 5799 },
  { name: "Smart Wi-Fi Router", description: "Dual-band router with parental controls.", price: 3999 },
  { name: "Streaming Microphone USB", description: "Cardioid microphone for podcasts and streaming.", price: 3199 },
  { name: "Ring Security Sensor Pack", description: "Window and door contact sensors.", price: 4599 },
  { name: "Wireless Presenter Remote", description: "Laser pointer and slide control remote.", price: 999 },
  { name: "Portable Document Scanner", description: "Compact scanner for forms and receipts.", price: 6499 },
  { name: "Smart IR Remote Hub", description: "Control TV and AC using mobile app.", price: 1999 },
  { name: "Rechargeable Emergency Light", description: "LED emergency backup lamp for outages.", price: 1499 },
];

const officeItCatalog = [
  { name: "All-in-One Desktop PC", description: "Space-saving desktop for front-desk operations.", price: 42999 },
  { name: "POS Billing System", description: "Touch billing setup for retail counters.", price: 38999 },
  { name: "Thermal Billing Printer", description: "Compact printer for POS receipts.", price: 4999 },
  { name: "USB Barcode Scanner", description: "Plug-and-play scanner for retail inventory.", price: 2799 },
  { name: "Label Printer", description: "Printer for product tags and barcode labels.", price: 6499 },
  { name: "24-port Gigabit Switch", description: "Network switch for growing offices.", price: 9999 },
  { name: "Enterprise Wi-Fi Router", description: "Dual-band router for business internet.", price: 6999 },
  { name: "Rackmount UPS", description: "Power backup for office network cabinets.", price: 15999 },
  { name: "Document Scanner", description: "High-speed scanner for forms and invoices.", price: 12499 },
  { name: "NAS Storage 2-Bay", description: "Central file backup storage for teams.", price: 21999 },
  { name: "IP Phone Desk Unit", description: "VoIP calling device for office desks.", price: 3299 },
  { name: "Fingerprint Attendance Machine", description: "Biometric attendance device for staff.", price: 5799 },
  { name: "Access Point Ceiling Mount", description: "Wi-Fi access point for larger premises.", price: 4399 },
  { name: "Cat6 Cable Box 305m", description: "Structured cabling roll for office setups.", price: 5899 },
  { name: "Server Cabinet 9U", description: "Wall-mount rack cabinet for network gear.", price: 8999 },
  { name: "LED Projector Business", description: "Presentation projector for meeting rooms.", price: 32999 },
  { name: "Conference Webcam", description: "Wide-angle webcam for team calls.", price: 5499 },
  { name: "Headset with Mic", description: "Wired headset for support desks.", price: 1599 },
  { name: "Desktop Labeling Gun", description: "Manual label gun for stock room tagging.", price: 799 },
  { name: "Cash Drawer", description: "POS cash drawer with receipt printer interface.", price: 3499 },
  { name: "Mini PC Office Edition", description: "Compact PC for counters and kiosks.", price: 26999 },
  { name: "LaserJet Office Printer", description: "Mono laser printer for invoice printing.", price: 15499 },
  { name: "Portable Wi-Fi Hotspot", description: "Backup internet device for operations.", price: 2999 },
  { name: "Surge Protector Strip", description: "Heavy-duty power strip for office equipment.", price: 899 },
];

const shops = [
  {
    shopName: "Korvex Computers",
    name: "Raj Shamani",
    email: "raj.shamani@korvex-computers.example",
    userCode: "KVC",
    address: "4th Floor, Orion Plaza, Pune, MH",
    phone: "+91-90000-1001",
    catalog: computerCatalog,
  },
  {
    shopName: "Nimbus Digital Hub",
    name: "Aarav Mehta",
    email: "aarav.mehta@nimbus-digital.example",
    userCode: "NDH",
    address: "12 Galaxy Road, Ahmedabad, GJ",
    phone: "+91-90000-1002",
    catalog: officeItCatalog,
  },
  {
    shopName: "Vertex Mobile Zone",
    name: "Kiran Rao",
    email: "kiran.rao@vertex-mobile.example",
    userCode: "VMZ",
    address: "88 Sunrise Arcade, Hyderabad, TS",
    phone: "+91-90000-1003",
    catalog: mobileCatalog,
  },
  {
    shopName: "NovaTech Solutions",
    name: "Ananya Iyer",
    email: "ananya.iyer@novatech.example",
    userCode: "NTS",
    address: "21 Lake View Rd, Kochi, KL",
    phone: "+91-90000-1004",
    catalog: officeItCatalog,
  },
  {
    shopName: "Orbit IT Mart",
    name: "Rohit Verma",
    email: "rohit.verma@orbit-it.example",
    userCode: "OIT",
    address: "55 Central Avenue, Jaipur, RJ",
    phone: "+91-90000-1005",
    catalog: officeItCatalog,
  },
  {
    shopName: "Bytewave Electronics",
    name: "Priya Menon",
    email: "priya.menon@bytewave.example",
    userCode: "BWE",
    address: "9 Metro Tower, Chennai, TN",
    phone: "+91-90000-1006",
    catalog: gadgetCatalog,
  },
  {
    shopName: "Axiom Computer House",
    name: "Vikram Singh",
    email: "vikram.singh@axiom-computer.example",
    userCode: "AXH",
    address: "31 Business Park, Lucknow, UP",
    phone: "+91-90000-1007",
    catalog: computerCatalog,
  },
  {
    shopName: "Zenith Gadget World",
    name: "Neha Kapoor",
    email: "neha.kapoor@zenith-gadget.example",
    userCode: "ZGW",
    address: "102 Park Street, Kolkata, WB",
    phone: "+91-90000-1008",
    catalog: gadgetCatalog,
  },
  {
    shopName: "Fusion Laptop Studio",
    name: "Arjun Das",
    email: "arjun.das@fusion-laptop.example",
    userCode: "FLS",
    address: "7 City Center, Indore, MP",
    phone: "+91-90000-1009",
    catalog: laptopCatalog,
  },
  {
    shopName: "Pioneer Systems",
    name: "Meera Joshi",
    email: "meera.joshi@pioneer-systems.example",
    userCode: "PNS",
    address: "66 Lake Road, Surat, GJ",
    phone: "+91-90000-1010",
    catalog: officeItCatalog,
  },
];

async function run() {
  const passwordHash = await bcrypt.hash(defaultPassword, 10);
  const results = [];

  for (const shop of shops) {
    const productCount = randInt(18, Math.min(25, shop.catalog.length));
    const selectedProducts = pickRandomItems(shop.catalog, productCount);

    const user = await prisma.user.upsert({
      where: { email: shop.email.toLowerCase() },
      create: {
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
      },
      update: {
        name: shop.name,
        userCode: shop.userCode,
        shopName: shop.shopName,
        shopStatus: "ACTIVE",
        shopExpiry: randomExpiry(),
        address: shop.address,
        phone: shop.phone,
        passwordHash,
      },
      select: {
        id: true,
        email: true,
        shopName: true,
        userCode: true,
      },
    });

    await prisma.product.deleteMany({
      where: { ownerId: user.id },
    });

    await prisma.product.createMany({
      data: selectedProducts.map((product, index) => ({
        name: product.name,
        description: product.description,
        price: product.price,
        quantity: randInt(6, 60),
        status: "ACTIVE",
        reorderLevel: randInt(3, 10),
        ownerId: user.id,
        serialNumber: index + 1,
        sku: `${shop.userCode}${String(index + 1).padStart(2, "0")}`,
      })),
    });

    results.push({
      shopName: user.shopName,
      email: user.email,
      userCode: user.userCode,
      products: selectedProducts.length,
    });
  }

  console.log("Seeded shopkeepers and products:");
  console.table(results);
  console.log(`Default password for seeded shopkeepers: ${defaultPassword}`);
}

run()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
