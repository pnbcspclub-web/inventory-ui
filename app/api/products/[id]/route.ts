import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export async function GET(_: Request, { params }: Params) {
  const { id } = await params;
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "SHOPKEEPER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const product = await prisma.product.findFirst({
    where: { id, ownerId: session.user.id },
    select: {
      id: true,
      name: true,
      sku: true,
      description: true,
      price: true,
      quantity: true,
      status: true,
      serialNumber: true,
      createdAt: true,
    },
  });
  if (!product) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(product);
}

export async function PUT(req: Request, { params }: Params) {
  const { id } = await params;
  const session = await auth();
  if (!session || session.user.role !== "SHOPKEEPER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const body = await req.json();
  const existing = await prisma.product.findFirst({
    where: { id, ownerId: session.user.id },
    select: {
      id: true,
      name: true,
      description: true,
      price: true,
      quantity: true,
      status: true,
    },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const nextQuantity =
    body.quantity !== undefined ? Number(body.quantity) : existing.quantity;
  const nextStatus =
    nextQuantity === 0 ? "SOLD" : body.status ?? existing.status;

  const product = await prisma.product.update({
    where: { id },
    data: {
      name: body.name ?? existing.name,
      description: body.description ?? existing.description,
      price: body.price ?? existing.price,
      quantity: nextQuantity,
      status: nextStatus,
    },
    select: {
      id: true,
      name: true,
      sku: true,
      description: true,
      price: true,
      quantity: true,
      status: true,
      serialNumber: true,
      createdAt: true,
    },
  });
  return NextResponse.json(product);
}

export async function DELETE(_: Request, { params }: Params) {
  const { id } = await params;
  const session = await auth();
  if (!session || session.user.role !== "SHOPKEEPER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const existing = await prisma.product.findFirst({
    where: { id, ownerId: session.user.id },
    select: { id: true },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const deleted = await prisma.product.deleteMany({
    where: { id, ownerId: session.user.id },
  });
  if (deleted.count === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
