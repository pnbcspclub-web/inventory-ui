import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const isShopkeeper = session.user.role === "SHOPKEEPER";
  const where: Prisma.OrderWhereInput | undefined = isShopkeeper
    ? { type: "SALE", createdById: session.user.id }
    : undefined;
  const orders = await prisma.order.findMany({
    where,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      type: true,
      status: true,
      partnerName: true,
      total: true,
      createdAt: true,
    },
  });
  return NextResponse.json(orders);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const isShopkeeper = session.user.role === "SHOPKEEPER";
  if (!body.type) {
    return NextResponse.json({ error: "Order type is required" }, { status: 400 });
  }
  if (isShopkeeper && body.type !== "SALE") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const total = Number(body.total ?? 0);
  if (!Number.isFinite(total) || total < 0) {
    return NextResponse.json({ error: "Invalid total" }, { status: 400 });
  }

  try {
    const order = await prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          type: body.type,
          status: body.status ?? "DRAFT",
          partnerName: body.partnerName ?? null,
          total,
          createdById: session.user.id,
        },
      });

      return created;
    });

    return NextResponse.json(order, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unable to save order" }, { status: 500 });
  }
}
