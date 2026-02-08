import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();
  if (!session || session.user.role !== "SHOPKEEPER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const productId = body.productId as string | undefined;
  const quantity = Number(body.quantity ?? 0);

  if (!productId || !Number.isFinite(quantity) || quantity <= 0) {
    return NextResponse.json({ error: "Invalid quantity" }, { status: 400 });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const product = await tx.product.findFirst({
        where: { id: productId, ownerId: session.user.id },
      });

      if (!product) {
        throw new Error("NotFound");
      }

      const updated = await tx.product.updateMany({
        where: { id: productId, ownerId: session.user.id, quantity: { gte: quantity } },
        data: { quantity: { decrement: quantity } },
      });

      if (updated.count === 0) {
        throw new Error("Insufficient");
      }

      const refreshed = await tx.product.findUnique({
        where: { id: productId },
      });

      if (!refreshed) {
        throw new Error("NotFound");
      }

      if (refreshed.quantity === 0 && refreshed.status !== "SOLD") {
        await tx.product.update({
          where: { id: productId },
          data: { status: "SOLD" },
        });
      }

      const unitPrice = Number(product.price);
      const lineTotal = unitPrice * quantity;
      if (!Number.isFinite(lineTotal) || Math.abs(lineTotal) >= 100_000_000) {
        throw new Error("TotalOverflow");
      }

      const order = await tx.order.create({
        data: {
          type: "SALE",
          status: "COMPLETED",
          total: lineTotal,
          createdById: session.user.id,
        },
      });

      return { orderId: order.id };
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown";
    if (message === "NotFound") {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    if (message === "Insufficient") {
      return NextResponse.json({ error: "Insufficient stock" }, { status: 400 });
    }
    if (message === "TotalOverflow") {
      return NextResponse.json(
        { error: "Total exceeds limit (max 99,999,999.99)" },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: "Unable to record sale" }, { status: 500 });
  }
}
