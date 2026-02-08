"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { Button, Card, Col, List, Row, Statistic, Typography } from "antd";
import Link from "next/link";

export default function DashboardPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [salesToday, setSalesToday] = useState(0);
  const [salesMonth, setSalesMonth] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalQuantity, setTotalQuantity] = useState(0);
  const [totalShopkeepers, setTotalShopkeepers] = useState(0);
  const [activeShops, setActiveShops] = useState(0);
  const [inactiveShops, setInactiveShops] = useState(0);
  const [todaySalesAll, setTodaySalesAll] = useState(0);
  const [expiringSoon, setExpiringSoon] = useState(0);
  const [inactiveShopList, setInactiveShopList] = useState<
    { id: string; shopName?: string | null; name?: string | null; phone?: string | null }[]
  >([]);
  const rupee = String.fromCharCode(0x20b9);

  const pollRef = useRef<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const isAdmin = session?.user?.role === "ADMIN";
      const res = await fetch(isAdmin ? "/api/admin/stats" : "/api/dashboard");
      if (!res.ok) {
        setLoading(false);
        return;
      }
      const data = await res.json();
      if (session?.user?.role === "ADMIN") {
        setTotalShopkeepers(data.totalShopkeepers ?? 0);
        setActiveShops(data.activeShops ?? 0);
        setInactiveShops(data.inactiveShops ?? 0);
        setTodaySalesAll(data.todaySales ?? 0);
        setExpiringSoon(data.expiringSoonShops ?? 0);
        setInactiveShopList(data.inactiveShopList ?? []);
      } else {
        setSalesToday(data.salesToday ?? 0);
        setSalesMonth(data.salesMonth ?? 0);
        setTotalProducts(data.totalProducts ?? 0);
        setTotalQuantity(data.totalQuantity ?? 0);
      }
      setLoading(false);
    };

    const stopPolling = () => {
      if (pollRef.current) {
        window.clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };

    const startPolling = () => {
      stopPolling();
      void fetchData();
      pollRef.current = window.setInterval(fetchData, 30000);
    };

    const handleVisibility = () => {
      if (!session?.user) return;
      if (document.visibilityState === "visible") {
        startPolling();
      } else {
        stopPolling();
      }
    };

    if (session?.user) {
      startPolling();
      document.addEventListener("visibilitychange", handleVisibility);
      return () => {
        stopPolling();
        document.removeEventListener("visibilitychange", handleVisibility);
      };
    }

    return undefined;
  }, [session]);

  const welcomeName = useMemo(
    () => session?.user?.shopName ?? session?.user?.name ?? "Shopkeeper",
    [session]
  );

  return (
    <div className="space-y-8">
      {session?.user?.role === "ADMIN" ? (
        <>
          <Row gutter={[20, 20]}>
            <Col xs={24} md={12} xl={6}>
              <Card loading={loading} className="shadow-sm border border-black/5">
                <Statistic title="Total Shops Registered" value={totalShopkeepers} />
              </Card>
            </Col>
            <Col xs={24} md={12} xl={6}>
              <Card loading={loading} className="shadow-sm border border-black/5">
                <Statistic
                  title="Active / Inactive Shops"
                  value={`${activeShops} / ${inactiveShops}`}
                />
              </Card>
            </Col>
            <Col xs={24} md={12} xl={6}>
              <Card loading={loading} className="shadow-sm border border-black/5">
                <Statistic
                  title="Today Sales (All Shops)"
                  value={todaySalesAll}
                  prefix={rupee}
                />
              </Card>
            </Col>
            <Col xs={24} md={12} xl={6}>
              <Card loading={loading} className="shadow-sm border border-black/5">
                <Statistic title="Expiring Soon Payments" value={expiringSoon} />
              </Card>
            </Col>
          </Row>

          <Row gutter={[20, 20]}>
            <Col xs={24} lg={12}>
              <Card title="Quick Actions" className="shadow-sm border border-black/5">
                <div className="flex flex-wrap gap-3">
                  <Link href="/admin/users">
                    <Button type="primary">Create New Shop</Button>
                  </Link>
                  <Link href="/admin/users">
                    <Button>Manage Shops</Button>
                  </Link>
                  <Link href="/admin/settings">
                    <Button>App Settings</Button>
                  </Link>
                </div>
                <div className="mt-4 text-sm text-[color:var(--color-muted)]">
                  Use shop management to reset passwords, suspend shops, and update permissions.
                </div>
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card title="Alerts & Notifications" className="shadow-sm border border-black/5">
                <div className="mb-3 text-sm text-[color:var(--color-muted)]">
                  Subscription expiry alerts will appear here.
                </div>
                <List
                  size="small"
                  dataSource={inactiveShopList}
                  locale={{ emptyText: "No inactive shops" }}
                  renderItem={(item) => (
                    <List.Item>
                      <div>
                        <div className="font-semibold">
                          {item.shopName ?? "Shop"} - {item.name ?? "Owner"}
                        </div>
                        <div className="text-xs text-[color:var(--color-muted)]">
                          {item.phone ?? "No phone on file"}
                        </div>
                      </div>
                      <div className="text-xs text-[color:var(--color-muted)]">
                        Suspended
                      </div>
                    </List.Item>
                  )}
                />
                {inactiveShops > 0 ? (
                  <div className="mt-3 text-sm text-[color:var(--color-muted)]">
                    Inactive shops: {inactiveShops}
                  </div>
                ) : null}
              </Card>
            </Col>
          </Row>
        </>
      ) : (
        <>
          <Card className="shadow-sm border border-black/5">
            <Typography.Title level={3} className="!mb-1">
              Welcome, {welcomeName} {"\uD83D\uDC4B"}
            </Typography.Title>
            <Typography.Text className="text-[color:var(--color-muted)]">
              Manage your products, track sales, and keep stock healthy.
            </Typography.Text>
          </Card>

          <Row gutter={[20, 20]} className="mt-4">
            <Col xs={24} md={12} xl={6}>
              <Card loading={loading} className="shadow-sm border border-black/5">
                <Statistic title="Total Products" value={totalProducts} />
              </Card>
            </Col>
            <Col xs={24} md={12} xl={6}>
              <Card loading={loading} className="shadow-sm border border-black/5">
                <Statistic title="Today Sale" value={salesToday} prefix={rupee} />
              </Card>
            </Col>
            <Col xs={24} md={12} xl={6}>
              <Card loading={loading} className="shadow-sm border border-black/5">
                <Statistic title="Monthly Sale" value={salesMonth} prefix={rupee} />
              </Card>
            </Col>
            <Col xs={24} md={12} xl={6}>
              <Card loading={loading} className="shadow-sm border border-black/5">
                <Statistic title="Available Stock (Qty)" value={totalQuantity} />
              </Card>
            </Col>
          </Row>
        </>
      )}
    </div>
  );
}
