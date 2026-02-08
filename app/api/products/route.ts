import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "SHOPKEEPER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const products = await prisma.product.findMany({
    where: { ownerId: session.user.id },
    orderBy: { serialNumber: "asc" },
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
  return NextResponse.json(products);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session || session.user.role !== "SHOPKEEPER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const body = await req.json();
  if (!session.user.userCode) {
    return NextResponse.json({ error: "User code not set" }, { status: 400 });
  }
  const product = await prisma.$transaction(async (tx) => {
    const latest = await tx.product.findFirst({
      where: { ownerId: session.user.id },
      orderBy: { serialNumber: "desc" },
      select: { serialNumber: true },
    });
    const serialNumber = (latest?.serialNumber ?? 0) + 1;
    const codePrefix = session.user.userCode;
    const paddedSerial = String(serialNumber).padStart(2, "0");
    const quantity = Number(body.quantity ?? 0);
    const status = quantity === 0 ? "SOLD" : body.status ?? "ACTIVE";
    return tx.product.create({
      data: {
        name: body.name,
        sku: `${codePrefix}${paddedSerial}`,
        description: body.description ?? null,
        price: body.price,
        quantity,
        status,
        reorderLevel: 0,
        ownerId: session.user.id,
        serialNumber,
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
  });
  return NextResponse.json(product, { status: 201 });
}
