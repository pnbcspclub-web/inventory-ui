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

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const monthAgo = new Date();
  monthAgo.setDate(monthAgo.getDate() - 30);

  const [salesToday, salesMonth, totals] = await Promise.all([
    prisma.order.aggregate({
      _sum: { total: true },
      where: {
        type: "SALE",
        status: "COMPLETED",
        createdById: session.user.id,
        createdAt: { gte: todayStart },
      },
    }),
    prisma.order.aggregate({
      _sum: { total: true },
      where: {
        type: "SALE",
        status: "COMPLETED",
        createdById: session.user.id,
        createdAt: { gte: monthAgo },
      },
    }),
    prisma.product.aggregate({
      _count: { _all: true },
      _sum: { quantity: true },
      where: { ownerId: session.user.id },
    }),
  ]);

  return NextResponse.json({
    salesToday: Number(salesToday._sum.total ?? 0),
    salesMonth: Number(salesMonth._sum.total ?? 0),
    totalProducts: totals._count._all,
    totalQuantity: Number(totals._sum.quantity ?? 0),
  });
}
