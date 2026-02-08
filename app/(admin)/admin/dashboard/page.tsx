import { prisma } from "@/lib/prisma";

const formatNumber = (value: number) =>
  value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

export default async function AdminDashboardPage() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [totalShops, expiringShops, newShopsThisMonth] = await Promise.all([
    prisma.user.count({
      where: { role: "SHOPKEEPER" },
    }),
    prisma.user.count({
      where: {
        role: "SHOPKEEPER",
        shopExpiry: {
          lte: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
        },
      },
    }),
    prisma.user.count({
      where: {
        role: "SHOPKEEPER",
        createdAt: { gte: startOfMonth },
      },
    }),
  ]);

  const revenuePerShop = 200;
  const totalRevenue = totalShops * revenuePerShop;

  return (
    <div className="space-y-6">
      <div className="hero-card p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--color-muted)]">
          Admin overview
        </p>
        <h1 className="mt-3 text-3xl font-semibold">Shop performance snapshot</h1>
        <p className="mt-2 text-sm text-[color:var(--color-muted)]">
          Key stats across all shop accounts and renewals.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="hero-stat p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[color:var(--color-muted)]">
            Total shops
          </p>
          <p className="mt-3 text-3xl font-semibold">{formatNumber(totalShops)}</p>
          <p className="mt-2 text-xs text-[color:var(--color-muted)]">
            Active shopkeeper accounts
          </p>
        </div>
        <div className="hero-stat p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[color:var(--color-muted)]">
            Expiring in 2 days
          </p>
          <p className="mt-3 text-3xl font-semibold">{formatNumber(expiringShops)}</p>
          <p className="mt-2 text-xs text-[color:var(--color-muted)]">
            Renewal follow-up required
          </p>
        </div>
        <div className="hero-stat p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[color:var(--color-muted)]">
            New this month
          </p>
          <p className="mt-3 text-3xl font-semibold">
            {formatNumber(newShopsThisMonth)}
          </p>
          <p className="mt-2 text-xs text-[color:var(--color-muted)]">
            Joined since {startOfMonth.toLocaleDateString()}
          </p>
        </div>
        <div className="hero-stat p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[color:var(--color-muted)]">
            Total revenue
          </p>
          <p className="mt-3 text-3xl font-semibold">
            INR {formatNumber(totalRevenue)}
          </p>
          <p className="mt-2 text-xs text-[color:var(--color-muted)]">
            Assumes INR {revenuePerShop} per shop
          </p>
        </div>
      </div>
    </div>
  );
}
