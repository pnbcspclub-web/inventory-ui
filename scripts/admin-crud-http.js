const crypto = require("crypto");
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

const baseUrl = process.env.BASE_URL || "http://localhost:3000";
const adminEmail = process.env.ADMIN_EMAIL;
const adminPassword = process.env.ADMIN_PASSWORD;
const debugAuth = process.env.DEBUG_AUTH === "1";

if (!adminEmail || !adminPassword) {
  console.error("Missing ADMIN_EMAIL or ADMIN_PASSWORD environment variables.");
  process.exit(1);
}

const cookieJar = new Map();

const splitSetCookie = (header) => {
  if (!header) return [];
  const parts = [];
  let start = 0;
  let inExpires = false;
  for (let i = 0; i < header.length; i += 1) {
    const segment = header.slice(i, i + 8).toLowerCase();
    if (segment === "expires=") inExpires = true;
    if (inExpires && header[i] === ";") inExpires = false;
    if (!inExpires && header[i] === "," && header[i + 1] === " ") {
      parts.push(header.slice(start, i));
      start = i + 2;
    }
  }
  parts.push(header.slice(start));
  return parts.filter(Boolean);
};

const updateCookies = (response) => {
  const setCookieHeader = response.headers.get("set-cookie");
  const setCookies = response.headers.getSetCookie?.() ?? splitSetCookie(setCookieHeader);
  if (debugAuth) {
    console.log("Set-Cookie:", setCookies);
  }
  for (const header of setCookies) {
    if (!header) continue;
    const [pair] = header.split(";");
    const [name, value] = pair.split("=");
    if (name && value) {
      cookieJar.set(name.trim(), value.trim());
    }
  }
};

const cookieHeader = () => {
  if (cookieJar.size === 0) return "";
  return Array.from(cookieJar.entries())
    .map(([name, value]) => `${name}=${value}`)
    .join("; ");
};

const randomSuffix = () => crypto.randomBytes(3).toString("hex").toUpperCase();
const makeUserCode = () => `S${Math.floor(Math.random() * 900 + 100)}`;

async function signInAdmin() {
  const csrfRes = await fetch(`${baseUrl}/api/auth/csrf`, {
    headers: { Accept: "application/json" },
  });
  updateCookies(csrfRes);
  if (debugAuth) {
    console.log("CSRF status:", csrfRes.status);
  }
  const csrfData = await csrfRes.json();
  if (!csrfData?.csrfToken) {
    throw new Error("Failed to fetch CSRF token.");
  }

  const form = new URLSearchParams({
    csrfToken: csrfData.csrfToken,
    email: adminEmail,
    password: adminPassword,
    role: "ADMIN",
    callbackUrl: `${baseUrl}/admin/dashboard`,
    redirect: "false",
    json: "true",
  });

  const loginRes = await fetch(`${baseUrl}/api/auth/callback/credentials`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
      Cookie: cookieHeader(),
    },
    body: form.toString(),
    redirect: "manual",
  });
  updateCookies(loginRes);
  if (debugAuth) {
    console.log("Login status:", loginRes.status);
  }

  const contentType = loginRes.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    const data = await loginRes.json();
    if (data?.error) {
      throw new Error(`Admin login failed: ${data.error}`);
    }
  } else if (loginRes.status >= 400) {
    throw new Error(`Admin login failed with status ${loginRes.status}`);
  }
}

async function fetchSession() {
  const res = await fetch(`${baseUrl}/api/auth/session`, {
    headers: { Cookie: cookieHeader() },
  });
  if (!res.ok) {
    throw new Error(`Session fetch failed: ${res.status}`);
  }
  return res.json();
}

async function run() {
  console.log("Signing in as admin...");
  await signInAdmin();
  const session = await fetchSession();
  console.log("Signed in as:", session?.user?.email, session?.user?.role);
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Not authenticated as ADMIN. Check ADMIN_EMAIL/ADMIN_PASSWORD.");
  }

  const suffix = randomSuffix();
  const email = `shop_${suffix.toLowerCase()}@example.com`;
  const userCode = makeUserCode();

  const createPayload = {
    name: `Owner ${suffix}`,
    email,
    password: `Test@${suffix}`,
    userCode,
    shopName: `Shop ${suffix}`,
    shopStatus: "ACTIVE",
    shopExpiry: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
    address: "Test address",
    phone: "9999999999",
    canAddProduct: true,
    canEditStock: true,
    canViewReports: true,
    canSellProduct: true,
    canViewOnly: false,
  };

  console.log("Creating shopkeeper via /api/users...");
  const createRes = await fetch(`${baseUrl}/api/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookieHeader(),
    },
    body: JSON.stringify(createPayload),
  });
  if (!createRes.ok) {
    const err = await createRes.text();
    throw new Error(`Create failed: ${createRes.status} ${err}`);
  }
  const created = await createRes.json();
  console.log("Created:", created);

  console.log("Reading list via /api/users...");
  const listRes = await fetch(`${baseUrl}/api/users`, {
    headers: { Cookie: cookieHeader() },
  });
  if (!listRes.ok) {
    const err = await listRes.text();
    throw new Error(`List failed: ${listRes.status} ${err}`);
  }
  const list = await listRes.json();
  const found = list.find((u) => u.id === created.id);
  console.log("Found in list:", !!found);

  console.log("Updating shopkeeper via /api/users/:id...");
  const updateRes = await fetch(`${baseUrl}/api/users/${created.id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookieHeader(),
    },
    body: JSON.stringify({
      shopStatus: "SUSPENDED",
      shopName: `${created.shopName} Updated`,
    }),
  });
  if (!updateRes.ok) {
    const err = await updateRes.text();
    throw new Error(`Update failed: ${updateRes.status} ${err}`);
  }
  const updated = await updateRes.json();
  console.log("Updated:", updated);

  console.log("Deleting shopkeeper via /api/users/:id...");
  const deleteRes = await fetch(`${baseUrl}/api/users/${created.id}`, {
    method: "DELETE",
    headers: { Cookie: cookieHeader() },
  });
  if (!deleteRes.ok) {
    const err = await deleteRes.text();
    throw new Error(`Delete failed: ${deleteRes.status} ${err}`);
  }
  const deleted = await deleteRes.json();
  console.log("Deleted:", deleted);

  console.log("Admin HTTP CRUD test completed successfully.");
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
