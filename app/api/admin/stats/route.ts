import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const expiryWindow = new Date(now);
  expiryWindow.setDate(now.getDate() + 7);

  const [
    totalShopkeepers,
    newThisMonth,
    activeShops,
    inactiveShops,
    todaySales,
    expiringSoon,
    inactiveShopList,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "SHOPKEEPER" } }),
    prisma.user.count({
      where: { role: "SHOPKEEPER", createdAt: { gte: monthStart } },
    }),
    prisma.user.count({
      where: { role: "SHOPKEEPER", shopStatus: "ACTIVE" },
    }),
    prisma.user.count({
      where: { role: "SHOPKEEPER", shopStatus: "SUSPENDED" },
    }),
    prisma.order.aggregate({
      _sum: { total: true },
      where: { type: "SALE", status: "COMPLETED", createdAt: { gte: todayStart } },
    }),
    prisma.user.count({
      where: {
        role: "SHOPKEEPER",
        shopExpiry: { gte: now, lte: expiryWindow },
      },
    }),
    prisma.user.findMany({
      where: { role: "SHOPKEEPER", shopStatus: "SUSPENDED" },
      select: { id: true, shopName: true, name: true, phone: true },
      take: 5,
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  return NextResponse.json({
    totalShopkeepers,
    newThisMonth,
    activeShops,
    inactiveShops,
    todaySales: Number(todaySales._sum.total ?? 0),
    expiringSoonShops: expiringSoon,
    inactiveShopList,
  });
}
