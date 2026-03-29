import { prisma } from "@/lib/prisma";
import { Card, Row, Col, Button } from "antd";
import {
  ShopOutlined,
  ClockCircleOutlined,
  UserAddOutlined,
  WalletOutlined,
  ArrowRightOutlined,
  TeamOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import Link from "next/link";

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

function readSettled<T>(result: PromiseSettledResult<T>, fallback: T): T {
  return result.status === "fulfilled" ? result.value : fallback;
}

export default async function AdminDashboardPage() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const expiryThreshold = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);

  const [
    totalShops,
    activeShops,
    suspendedShops,
    expiringShops,
    newShopsThisMonth,
    recentShops,
    monthlySalesResult,
  ] = await Promise.allSettled([
    prisma.user.count({ where: { role: "SHOPKEEPER" } }),
    prisma.user.count({
      where: { role: "SHOPKEEPER", shopStatus: "ACTIVE" },
    }),
    prisma.user.count({
      where: { role: "SHOPKEEPER", shopStatus: "SUSPENDED" },
    }),
    prisma.user.count({
      where: {
        role: "SHOPKEEPER",
        shopExpiry: { gte: now, lte: expiryThreshold },
      },
    }),
    prisma.user.count({
      where: { role: "SHOPKEEPER", createdAt: { gte: startOfMonth } },
    }),
    prisma.user.findMany({
      where: { role: "SHOPKEEPER" },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        name: true,
        userCode: true,
        shopName: true,
        shopStatus: true,
        createdAt: true,
      },
    }),
    prisma.sale.aggregate({
      _sum: { total: true },
      where: { createdAt: { gte: startOfMonth } },
    }),
  ]);

  const totalShopCount = readSettled(totalShops, 0);
  const activeShopCount = readSettled(activeShops, 0);
  const suspendedShopCount = readSettled(suspendedShops, 0);
  const expiringShopCount = readSettled(expiringShops, 0);
  const newShopCount = readSettled(newShopsThisMonth, 0);
  const recentShopRows = readSettled(recentShops, []);
  const monthlySalesAggregate =
    monthlySalesResult.status === "fulfilled"
      ? monthlySalesResult.value
      : { _sum: { total: 0 } };

  const monthlySales = Number(monthlySalesAggregate._sum.total ?? 0);
  const activeRatio =
    totalShopCount === 0 ? 0 : Math.round((activeShopCount / totalShopCount) * 100);
  const avgSalesPerActiveShop =
    activeShopCount === 0 ? 0 : monthlySales / activeShopCount;

  const growthTip =
    expiringShopCount > 0
      ? `You have ${expiringShopCount} shop${expiringShopCount === 1 ? "" : "s"} expiring within 48 hours. Send reminders to prevent service interruptions.`
      : suspendedShopCount > 0
        ? `${suspendedShopCount} shop${suspendedShopCount === 1 ? "" : "s"} currently suspended. Review account status and renewals for reactivation opportunities.`
        : newShopCount > 0
          ? `${newShopCount} new shop${newShopCount === 1 ? "" : "s"} joined this month. Follow through on onboarding to improve activation.`
          : "No urgent admin actions right now. Use notifications and user management to keep accounts healthy.";

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col justify-between gap-6 rounded-[32px] border border-border bg-surface p-8 md:flex-row md:items-center">
        <div>
          <h2 className="mb-1 text-3xl font-bold tracking-tight text-foreground">
            Admin Overview
          </h2>
          <p className="text-base font-medium text-muted">
            Monitor platform performance and shop activity at a glance.
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/users?mode=create">
            <Button
              type="primary"
              icon={<UserAddOutlined />}
              size="large"
              className="h-12 rounded-2xl border-none bg-brand px-6 font-bold shadow-lg shadow-blue-500/20 hover:bg-brand-strong"
            >
              Add New Shop
            </Button>
          </Link>
          <Link href="/admin/settings">
            <Button
              icon={<SettingOutlined />}
              size="large"
              className="h-12 rounded-2xl border-border px-6 font-bold hover:border-gray-300 hover:bg-surface-muted"
            >
              Settings
            </Button>
          </Link>
        </div>
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24} sm={12} lg={6}>
          <div className="rounded-[32px] border border-border bg-surface p-7 transition-all hover:border-brand/30">
            <div className="mb-4 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-soft text-brand">
                <ShopOutlined className="text-xl" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted">
                Active Shops
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-4xl font-black tracking-tight text-foreground leading-none">
                {activeShopCount}
              </span>
              <span className="text-sm font-bold text-muted/80 mt-1">shops</span>
            </div>
            <div className="mt-3 inline-flex w-fit items-center gap-2 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-accent">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              {totalShopCount} total accounts
            </div>
          </div>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <div className="rounded-[32px] border border-border bg-surface p-7 transition-all hover:border-rose-500/30">
            <div className="mb-4 flex items-center gap-4">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                  expiringShopCount > 0 ? "bg-rose-500/10 text-rose-500" : "bg-surface-muted text-muted"
                }`}
              >
                <ClockCircleOutlined className="text-xl" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted">
                Critical Renewals
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`text-4xl font-black tracking-tight leading-none ${
                  expiringShopCount > 0 ? "text-rose-500" : "text-foreground"
                }`}
              >
                {expiringShopCount}
              </span>
              <span className="text-sm font-bold text-muted/80 mt-1">urgent</span>
            </div>
            <div className="mt-3 text-xs font-bold text-muted">
              Expiring in 48 hours
            </div>
          </div>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <div className="rounded-[32px] border border-border bg-surface p-7 transition-all hover:border-emerald-500/30">
            <div className="mb-4 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-accent">
                <TeamOutlined className="text-xl" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted">
                New This Month
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-4xl font-black tracking-tight text-foreground leading-none">
                {newShopCount}
              </span>
              <span className="text-sm font-bold text-muted/80 mt-1">new</span>
            </div>
            <div className="mt-3 truncate text-xs font-bold text-muted">
              Since {startOfMonth.toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
            </div>
          </div>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <div className="rounded-[32px] border border-border bg-surface p-7 transition-all hover:border-amber-500/30">
            <div className="mb-4 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500">
                <WalletOutlined className="text-xl" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted">
                Sales This Month
              </span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-black tracking-tight text-foreground">
                {currencyFormatter.format(monthlySales)}
              </span>
            </div>
            <div className="mt-3 text-xs font-bold text-muted">
              Based on recorded sales
            </div>
          </div>
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <Card
            title={
              <span className="text-xl font-bold tracking-tight text-foreground">
                Recent Onboarding
              </span>
            }
            variant="borderless"
            className="overflow-hidden rounded-[32px] border border-border"
            extra={
              <Link
                href="/admin/users"
                className="text-sm font-bold text-brand hover:text-brand-strong"
              >
                View All <ArrowRightOutlined className="text-[10px]" />
              </Link>
            }
          >
            {recentShopRows.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-surface-muted px-6 py-10 text-center text-sm font-medium text-muted">
                No shopkeepers have been created yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full border-separate border-spacing-0">
                  <thead>
                    <tr>
                      <th className="border-b border-border px-0 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-muted">
                        Shop Name
                      </th>
                      <th className="border-b border-border px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-muted">
                        Status
                      </th>
                      <th className="border-b border-border px-0 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-muted">
                        Joined
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentShopRows.map((shop) => {
                      const isActive = shop.shopStatus === "ACTIVE";

                      return (
                        <tr key={shop.id}>
                          <td className="border-b border-border py-4 pr-4 align-top">
                            <div className="font-bold text-foreground">
                              {shop.shopName || shop.name || "Unnamed shop"}
                            </div>
                            <div className="text-[10px] font-bold uppercase tracking-tighter text-muted">
                              {shop.userCode || "No code"}
                            </div>
                          </td>
                          <td className="border-b border-border px-4 py-4 align-top">
                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-[11px] font-bold ${
                                isActive ? "bg-emerald-500/10 text-accent" : "bg-rose-500/10 text-rose-600"
                              }`}
                            >
                              {shop.shopStatus}
                            </span>
                          </td>
                          <td className="border-b border-border py-4 align-top text-sm font-medium text-muted">
                            {new Date(shop.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card
            title={
              <span className="text-xl font-bold tracking-tight text-foreground">
                Quick Insights
              </span>
            }
            variant="borderless"
            className="h-full rounded-[32px] border border-border"
          >
            <div className="space-y-6">
              <div className="rounded-2xl border border-brand/20 bg-brand-soft p-5">
                <p className="mb-2 block text-base font-semibold text-brand">
                  Growth Tip
                </p>
                <p className="text-sm font-medium leading-relaxed text-brand/80">
                  {growthTip}
                </p>
              </div>

              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between rounded-xl bg-surface-muted p-3 text-sm">
                  <span className="font-bold text-muted">Avg Monthly Sales/Active Shop</span>
                  <span className="font-black text-foreground">
                    {currencyFormatter.format(avgSalesPerActiveShop)}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-surface-muted p-3 text-sm">
                  <span className="font-bold text-muted">Active/Total Ratio</span>
                  <span className="font-black text-foreground">{activeRatio}%</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-surface-muted p-3 text-sm">
                  <span className="font-bold text-muted">Suspended Shops</span>
                  <span className="font-black text-foreground">{suspendedShopCount}</span>
                </div>
              </div>

              <Link href="/admin/notifications">
                <Button
                  block
                  className="mt-4 h-12 rounded-2xl border-border font-bold text-muted hover:border-brand hover:text-brand"
                >
                  System Notifications
                </Button>
              </Link>
            </div>
          </Card>
        </Col>
      </Row>


    </div>
  );
}
