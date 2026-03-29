import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireActiveShopkeeper } from "@/lib/session-guards";

const productSelect = {
  id: true,
  name: true,
  sku: true,
  description: true,
  price: true,
  quantity: true,
  status: true,
  serialNumber: true,
  createdAt: true,
} as const;

export async function GET() {
  const { response, session } = requireActiveShopkeeper(await auth());
  if (response) {
    return response;
  }
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const products = await prisma.product.findMany({
    where: { ownerId: session.user.id },
    orderBy: { serialNumber: "asc" },
    select: productSelect,
  });
  return NextResponse.json(products);
}

export async function POST(req: Request) {
  const { response, session } = requireActiveShopkeeper(await auth());
  if (response) {
    return response;
  }
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  if (!session.user.userCode) {
    return NextResponse.json({ error: "User code not set" }, { status: 400 });
  }

  try {
    const product = await prisma.$transaction(async (tx) => {
      const stats = await tx.product.aggregate({
        where: { ownerId: session.user.id },
        _count: { _all: true },
        _max: { serialNumber: true },
      });

      if (stats._count._all >= 100) {
        throw new Error("InventoryLimit");
      }

      const serialNumber = (stats._max.serialNumber ?? 0) + 1;
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
        select: productSelect,
      });
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "InventoryLimit") {
      return NextResponse.json(
        { error: "Inventory limit reached (max 100 products)" },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: "Unable to create product" }, { status: 500 });
  }
}
