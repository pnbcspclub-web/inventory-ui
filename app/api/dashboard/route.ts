import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireActiveShopkeeper } from "@/lib/session-guards";

export async function GET() {
  const { response, session } = requireActiveShopkeeper(await auth());
  if (response) {
    return response;
  }
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const [salesToday, salesMonth, totals, lowStockCount, recentProducts] = await Promise.all([
    (prisma.sale?.aggregate({
      _sum: { total: true },
      where: {
        createdById: userId,
        createdAt: { gte: todayStart },
      },
    }) ?? Promise.resolve({ _sum: { total: 0 } })),
    (prisma.sale?.aggregate({
      _sum: { total: true },
      where: {
        createdById: userId,
        createdAt: { gte: monthStart },
      },
    }) ?? Promise.resolve({ _sum: { total: 0 } })),
    prisma.product.aggregate({
      _count: { _all: true },
      _sum: { quantity: true },
      where: { ownerId: userId },
    }),
    prisma.product.count({
      where: {
        ownerId: userId,
        quantity: { gt: 0, lte: 5 },
      },
    }),
    prisma.product.findMany({
      where: { ownerId: userId },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        sku: true,
        name: true,
        price: true,
        quantity: true,
      },
    }),
  ]);

  return NextResponse.json({
    salesToday: Number(salesToday?._sum?.total ?? 0),
    salesMonth: Number(salesMonth?._sum?.total ?? 0),
    totalProducts: totals._count._all,
    totalQuantity: Number(totals._sum.quantity ?? 0),
    lowStockCount,
    recentProducts: recentProducts.map((product) => ({
      ...product,
      price: Number(product.price),
    })),
  });
}
