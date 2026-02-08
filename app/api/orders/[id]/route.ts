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
  const isShopkeeper = session.user.role === "SHOPKEEPER";
  const order = await prisma.order.findUnique({
    where: { id },
    select: {
      id: true,
      type: true,
      status: true,
      partnerName: true,
      total: true,
      createdById: true,
      createdAt: true,
    },
  });
  if (!order) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (isShopkeeper && order.createdById !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(order);
}

export async function PUT(req: Request, { params }: Params) {
  const { id } = await params;
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const isShopkeeper = session.user.role === "SHOPKEEPER";
  const existing = await prisma.order.findUnique({
    where: { id },
    select: {
      id: true,
      type: true,
      status: true,
      partnerName: true,
      total: true,
      createdById: true,
    },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (isShopkeeper && existing.createdById !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const total = Number(body.total ?? existing.total ?? 0);
  if (!Number.isFinite(total) || total < 0) {
    return NextResponse.json({ error: "Invalid total" }, { status: 400 });
  }
  const nextStatus = body.status ?? existing.status;
  const nextType = body.type ?? existing.type;
  if (isShopkeeper && nextType !== "SALE") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const updated = await prisma.$transaction(async (tx) => {
      const order = await tx.order.update({
        where: { id },
        data: {
          type: nextType,
          status: nextStatus,
          partnerName: body.partnerName ?? existing.partnerName,
          total,
        },
        select: {
          id: true,
          type: true,
          status: true,
          partnerName: true,
          total: true,
          createdAt: true,
        },
      });

      return order;
    });

    return NextResponse.json(updated);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown";
    return NextResponse.json({ error: "Unable to update order" }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: Params) {
  const { id } = await params;
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const isShopkeeper = session.user.role === "SHOPKEEPER";
  const existing = await prisma.order.findUnique({
    where: { id },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (isShopkeeper && existing.createdById !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.$transaction(async (tx) => {
    await tx.order.delete({ where: { id } });
  });

  return NextResponse.json({ ok: true });
}
