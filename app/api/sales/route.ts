import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { guardActiveShopkeeper, requireActiveShopkeeper } from "@/lib/session-guards";

const saleSelect = {
  id: true,
  total: true,
  quantity: true,
  createdAt: true,
} as const;

type ProductSalesInsight = {
  productId: string;
  name: string;
  code: string;
  quantity: number;
};

export async function GET(req: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const guard =
    session.user.role === "SHOPKEEPER" ? guardActiveShopkeeper(session) : null;
  if (guard) {
    return guard;
  }

  const { searchParams } = new URL(req.url);
  const summary = searchParams.get("summary") === "1";
  const requestedTake = Number(searchParams.get("take") ?? 0);
  const take =
    Number.isFinite(requestedTake) && requestedTake > 0
      ? Math.min(requestedTake, 200)
      : 100;
  const isShopkeeper = session.user.role === "SHOPKEEPER";
  const baseWhere = isShopkeeper ? { createdById: session.user.id } : undefined;

  if (summary) {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setHours(0, 0, 0, 0);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

    const [totals, recentSales, groupedProductSales] = await Promise.all([
      prisma.sale.aggregate({
        where: baseWhere,
        _count: { _all: true },
        _sum: { total: true, quantity: true },
        _avg: { total: true },
      }),
      prisma.sale.findMany({
        where: {
          ...(baseWhere ?? {}),
          createdAt: { gte: sevenDaysAgo },
        },
        orderBy: { createdAt: "asc" },
        select: saleSelect,
      }),
      prisma.sale.groupBy({
        by: ["productId"],
        where: baseWhere,
        _sum: { quantity: true },
      }),
    ]);

    const dailyTotals = new Map<string, number>();
    for (let i = 0; i < 7; i += 1) {
      const date = new Date(sevenDaysAgo);
      date.setDate(sevenDaysAgo.getDate() + i);
      const key = date.toLocaleDateString("en-CA");
      dailyTotals.set(key, 0);
    }

    recentSales.forEach((sale) => {
      const key = new Date(sale.createdAt).toLocaleDateString("en-CA");
      if (!dailyTotals.has(key)) return;
      dailyTotals.set(key, (dailyTotals.get(key) ?? 0) + Number(sale.total));
    });

    const productIds = groupedProductSales.map((item) => item.productId);
    const products =
      productIds.length > 0
        ? await prisma.product.findMany({
            where: { id: { in: productIds } },
            select: { id: true, name: true, sku: true },
          })
        : [];

    const productMap = new Map(
      products.map((product) => [
        product.id,
        { name: product.name, code: product.sku },
      ])
    );
    const rankedProducts: ProductSalesInsight[] = groupedProductSales
      .map((item) => ({
        productId: item.productId,
        name: productMap.get(item.productId)?.name ?? "Unknown Product",
        code: productMap.get(item.productId)?.code ?? "N/A",
        quantity: Number(item._sum.quantity ?? 0),
      }))
      .filter((item) => item.quantity > 0)
      .sort((a, b) => {
        if (b.quantity !== a.quantity) return b.quantity - a.quantity;
        return a.name.localeCompare(b.name);
      });

    const mostSoldProduct = rankedProducts[0] ?? null;
    const leastSoldProduct =
      rankedProducts.length > 0
        ? [...rankedProducts].sort((a, b) => {
            if (a.quantity !== b.quantity) return a.quantity - b.quantity;
            return a.name.localeCompare(b.name);
          })[0]
        : null;

    return NextResponse.json({
      count: totals._count._all,
      total: Number(totals._sum.total ?? 0),
      units: Number(totals._sum.quantity ?? 0),
      average: Number(totals._avg.total ?? 0),
      last7Days: Array.from(dailyTotals, ([date, total]) => ({ date, total })),
      mostSoldProduct,
      leastSoldProduct,
    });
  }

  const sales = await prisma.sale.findMany({
    where: baseWhere,
    orderBy: { createdAt: "desc" },
    take,
    select: saleSelect,
  });
  return NextResponse.json(
    sales.map((sale) => ({
      ...sale,
      total: Number(sale.total),
    }))
  );
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
  const productId = body.productId as string | undefined;
  const quantity = Number(body.quantity ?? 0);

  if (!productId || !Number.isFinite(quantity) || quantity <= 0) {
    return NextResponse.json({ error: "Invalid quantity" }, { status: 400 });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const product = await tx.product.findFirst({
        where: { id: productId, ownerId: session.user.id },
        select: {
          id: true,
          price: true,
          quantity: true,
          status: true,
        },
      });

      if (!product) {
        throw new Error("NotFound");
      }

      if (product.quantity < quantity) {
        throw new Error("Insufficient");
      }

      const nextQuantity = product.quantity - quantity;
      const nextStatus = nextQuantity === 0 ? "SOLD" : product.status;

      const updated = await tx.product.updateMany({
        where: { id: productId, ownerId: session.user.id, quantity: { gte: quantity } },
        data: {
          quantity: { decrement: quantity },
          status: nextStatus,
        },
      });

      if (updated.count === 0) {
        throw new Error("Insufficient");
      }

      const unitPrice = Number(product.price);
      const lineTotal = unitPrice * quantity;
      if (!Number.isFinite(lineTotal) || Math.abs(lineTotal) >= 100_000_000) {
        throw new Error("TotalOverflow");
      }

      const sale = await tx.sale.create({
        data: {
          productId,
          quantity,
          total: lineTotal,
          createdById: session.user.id,
        },
      });

      return { saleId: sale.id };
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
