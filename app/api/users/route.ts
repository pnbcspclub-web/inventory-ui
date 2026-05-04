import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { assignCodeToUser, serializeUserWithCodes } from "@/lib/user-codes";

const defaultUserInclude = {
  primaryCode: { select: { id: true, value: true } },
  codeAssignments: {
    orderBy: [{ assignedAt: "asc" as const }],
    select: {
      assignedAt: true,
      code: { select: { id: true, value: true } },
    },
  },
};

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

  if (view === "picker") {
    const users = await prisma.user.findMany({
      where: { role: "SHOPKEEPER" },
      orderBy: { createdAt: "desc" },
      take,
      select: pickerUserSelect,
    });
    return NextResponse.json(users);
  }

  const users = await prisma.user.findMany({
    where: { role: "SHOPKEEPER" },
    orderBy: { createdAt: "desc" },
    take,
    include: defaultUserInclude,
  });
  return NextResponse.json(users.map((user) => serializeUserWithCodes(user)));
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
  const createdUser = await prisma.user.create({
    data: {
      name: body.name ?? null,
      email: body.email.toLowerCase(),
      role: "SHOPKEEPER",
      shopName: body.shopName ?? null,
      shopStatus: body.shopStatus ?? "ACTIVE",
      shopExpiry: body.shopExpiry ? new Date(body.shopExpiry) : null,
      address: body.address ?? null,
      phone: body.phone ?? null,
      passwordHash,
      mustChangePassword: true,
    },
    include: defaultUserInclude,
  });

  const rawCodes = Array.isArray(body.userCodes)
    ? body.userCodes
    : body.userCode
      ? [body.userCode]
      : [];
  const normalizedCodes: string[] = Array.from(
    new Set(
      rawCodes
        .map((value: unknown) => String(value ?? "").trim().toUpperCase())
        .filter(Boolean)
    )
  );

  let user = createdUser;
  for (const [index, code] of normalizedCodes.entries()) {
    user = await assignCodeToUser({
      ownerId: createdUser.id,
      userId: createdUser.id,
      code,
      assignedById: session.user.id,
      setPrimary: index === 0,
    });
  }

  return NextResponse.json(serializeUserWithCodes(user), { status: 201 });
}
