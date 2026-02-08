import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: Request, { params }: Params) {
  const { id } = await params;
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const body = await req.json();
  const nextPasswordHash = body.password
    ? await bcrypt.hash(body.password, 10)
    : undefined;
  const user = await prisma.user.update({
    where: { id },
    data: {
      name: body.name ?? undefined,
      userCode: body.userCode ?? undefined,
      shopName: body.shopName ?? undefined,
      shopStatus: body.shopStatus ?? undefined,
      shopExpiry: body.shopExpiry ? new Date(body.shopExpiry) : undefined,
      address: body.address ?? undefined,
      phone: body.phone ?? undefined,
      passwordHash: nextPasswordHash,
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
      createdAt: true,
    },
  });
  return NextResponse.json(user);
}

export async function DELETE(_: Request, { params }: Params) {
  const { id } = await params;
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
