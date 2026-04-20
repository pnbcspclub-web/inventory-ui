"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { Card, Col, Row, Statistic } from "antd";

type DailyBucket = { date: string; total: number };
type ProductSalesInsight = {
  productId: string;
  name: string;
  code: string;
  quantity: number;
} | null;

type SalesSummary = {
  count: number;
  total: number;
  units: number;
  average: number;
  last7Days: DailyBucket[];
  mostSoldProduct: ProductSalesInsight;
  leastSoldProduct: ProductSalesInsight;
};

const rupee = String.fromCharCode(0x20b9);

const formatMoney = (value: number) =>
  `${rupee}${Number(value).toLocaleString("en-IN")}`;

export default function InsightsPage() {
  const { data: session } = useSession();
  const [summary, setSummary] = useState<SalesSummary>({
    count: 0,
    total: 0,
    units: 0,
    average: 0,
    last7Days: [],
    mostSoldProduct: null,
    leastSoldProduct: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const res = await fetch("/api/sales?summary=1");
      if (res.ok) {
        const data = (await res.json()) as SalesSummary;
        setSummary(data);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const isAdmin = session?.user?.role === "ADMIN";

  const stats = useMemo(() => {
    return {
      totals: {
        count: summary.count,
        sales: summary.total,
        units: summary.units,
      },
      average: summary.average,
      mostSoldProduct: summary.mostSoldProduct,
      leastSoldProduct: summary.leastSoldProduct,
    };
  }, [summary]);

  const last7Days = useMemo(() => summary.last7Days, [summary]);

  const maxDay = Math.max(1, ...last7Days.map((d) => d.total));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-[color:var(--foreground)]">
          Insights
        </h1>
          <p className="text-sm text-[color:var(--muted)]">
            {isAdmin
            ? "All shop sales performance at a glance."
            : "Sales insights based on your shop activity."}
          </p>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading} className="border border-black/5 shadow-sm">
            <Statistic title="Total Sales" value={formatMoney(stats.totals.sales)} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading} className="border border-black/5 shadow-sm">
            <Statistic title="Units Sold" value={stats.totals.units} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading} className="border border-black/5 shadow-sm">
            <Statistic title="Sales Logged" value={stats.totals.count} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading} className="border border-black/5 shadow-sm">
            <Statistic title="Avg Sale Value" value={formatMoney(stats.average)} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Card
            loading={loading}
            title="Most Sold Product"
            className="border border-black/5 shadow-sm"
          >
            {stats.mostSoldProduct ? (
              <div className="space-y-1">
                <div className="text-base font-semibold text-[color:var(--foreground)]">
                  {stats.mostSoldProduct.name}
                </div>
                <div className="text-sm text-[color:var(--muted)]">
                  Product code: {stats.mostSoldProduct.code}
                </div>
                <div className="text-sm text-[color:var(--muted)]">
                  Quantity sold: {stats.mostSoldProduct.quantity}
                </div>
              </div>
            ) : (
              <div className="text-sm text-[color:var(--muted)]">
                No sales recorded yet.
              </div>
            )}
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card
            loading={loading}
            title="Least Sold Product"
            className="border border-black/5 shadow-sm"
          >
            {stats.leastSoldProduct ? (
              <div className="space-y-1">
                <div className="text-base font-semibold text-[color:var(--foreground)]">
                  {stats.leastSoldProduct.name}
                </div>
                <div className="text-sm text-[color:var(--muted)]">
                  Product code: {stats.leastSoldProduct.code}
                </div>
                <div className="text-sm text-[color:var(--muted)]">
                  Quantity sold: {stats.leastSoldProduct.quantity}
                </div>
              </div>
            ) : (
              <div className="text-sm text-[color:var(--muted)]">
                No sales recorded yet.
              </div>
            )}
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card
            title="Last 7 Days Sales"
            className="border border-black/5 shadow-sm"
            loading={loading}
          >
            <div className="overflow-x-auto pb-4">
              <div className="grid grid-cols-7 gap-3 min-w-[500px]">
                {last7Days.map((day) => (
                  <div key={day.date} className="flex flex-col items-center gap-2">
                    <div className="relative h-24 lg:h-32 w-full rounded-full bg-[color:var(--surface-muted)]">
                      <div
                        className="absolute bottom-0 left-0 right-0 rounded-full bg-[color:var(--brand)] transition-all duration-500"
                        style={{ height: `${Math.round((day.total / maxDay) * 100)}%` }}
                      />
                    </div>
                    <div className="text-[9px] lg:text-[10px] font-semibold text-[color:var(--muted)]">
                      {day.date.slice(5)}
                    </div>
                    <div className="text-[10px] lg:text-xs font-semibold text-[color:var(--foreground)] truncate w-full text-center">
                      {formatMoney(day.total)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card
            title="Sales Notes"
            className="border border-black/5 shadow-sm"
            loading={loading}
          >
            <div className="space-y-3 text-sm text-[color:var(--muted)]">
              <div className="rounded-lg border border-[color:var(--border)] bg-[color:var(--surface-muted)] p-3 text-xs text-[color:var(--muted)]">
                Tip: Record sales daily to keep your revenue trend accurate.
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
