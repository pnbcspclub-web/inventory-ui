import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const defaultUserSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  userCode: true,
  shopName: true,
  shopStatus: true,
  shopExpiry: true,
  address: true,
  phone: true,
  mustChangePassword: true,
  createdAt: true,
} as const;

const pickerUserSelect = {
  id: true,
  name: true,
  email: true,
  shopName: true,
} as const;

export async function GET(req: Request) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { searchParams } = new URL(req.url);
  const view = searchParams.get("view");
  const requestedTake = Number(searchParams.get("take") ?? 0);
  const take =
    Number.isFinite(requestedTake) && requestedTake > 0
      ? Math.min(requestedTake, 500)
      : undefined;

  const users = await prisma.user.findMany({
    where: { role: "SHOPKEEPER" },
    orderBy: { createdAt: "desc" },
    take,
    select: view === "picker" ? pickerUserSelect : defaultUserSelect,
  });
  return NextResponse.json(users);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const body = await req.json();
  if (!body.email || !body.password) {
    return NextResponse.json({ error: "Email and password required" }, { status: 400 });
  }
  const passwordHash = await bcrypt.hash(body.password, 10);
  const user = await prisma.user.create({
    data: {
      name: body.name ?? null,
      email: body.email.toLowerCase(),
      role: "SHOPKEEPER",
      userCode: body.userCode ?? null,
      shopName: body.shopName ?? null,
      shopStatus: body.shopStatus ?? "ACTIVE",
      shopExpiry: body.shopExpiry ? new Date(body.shopExpiry) : null,
      address: body.address ?? null,
      phone: body.phone ?? null,
      passwordHash,
      mustChangePassword: true,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      userCode: true,
      shopName: true,
      shopStatus: true,
      shopExpiry: true,
      address: true,
      phone: true,
      mustChangePassword: true,
      createdAt: true,
    },
  });
  return NextResponse.json(user, { status: 201 });
}
