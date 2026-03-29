"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { Button, Card, Col, List, Row, Tag } from "antd";
import Link from "next/link";

import { 
  Package, 
  Database, 
  IndianRupee, 
  TrendingUp, 
  PlusCircle, 
  LineChart,
  AlertCircle,
  Clock,
  LayoutDashboard,
  Settings,
  ArrowUpRight
} from "lucide-react";

export default function DashboardPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [salesToday, setSalesToday] = useState(0);
  const [salesMonth, setSalesMonth] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalQuantity, setTotalQuantity] = useState(0);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [recentProducts, setRecentProducts] = useState<
    { id: string; sku: string; name: string; price: number; quantity: number }[]
  >([]);
  const [totalShopkeepers, setTotalShopkeepers] = useState(0);
  const [activeShops, setActiveShops] = useState(0);
  const [inactiveShops, setInactiveShops] = useState(0);
  const [todaySalesAll, setTodaySalesAll] = useState(0);
  const [expiringSoon, setExpiringSoon] = useState(0);
  const [inactiveShopList, setInactiveShopList] = useState<
    { id: string; shopName?: string | null; name?: string | null; phone?: string | null }[]
  >([]);

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
        setLowStockCount(data.lowStockCount ?? 0);
        setRecentProducts(data.recentProducts ?? []);
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
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      {session?.user?.role === "ADMIN" ? (
        <>
          {/* Admin Header */}
          <div className="bg-surface rounded-[24px] lg:rounded-[32px] p-5 lg:p-8 border border-border flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <LayoutDashboard className="w-4 h-4 lg:w-5 lg:h-5 text-brand" />
                <span className="text-muted font-bold uppercase tracking-[0.2em] text-[9px] lg:text-[10px]">Admin Dashboard</span>
              </div>
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground tracking-tight">System Overview</h1>
              <p className="text-muted text-sm lg:text-base font-medium mt-1">Manage your platform and monitor all shops in real-time.</p>
            </div>
            <div className="flex gap-2 lg:gap-3">
              <Link href="/admin/users?mode=create" className="flex-1 md:flex-none">
                <Button 
                  type="primary" 
                  icon={<PlusCircle className="w-4 h-4" />}
                  size="large"
                  className="h-10 lg:h-12 w-full px-4 lg:px-6 rounded-xl lg:rounded-2xl font-bold bg-brand hover:bg-brand-strong border-none flex items-center justify-center gap-2"
                >
                  Create Shop
                </Button>
              </Link>
              <Link href="/admin/settings" className="flex-1 md:flex-none">
                <Button 
                  icon={<Settings className="w-4 h-4" />}
                  size="large"
                  className="h-10 lg:h-12 w-full px-4 lg:px-6 rounded-xl lg:rounded-2xl font-bold border-border hover:border-gray-300 hover:bg-surface-muted flex items-center justify-center gap-2"
                >
                  Config
                </Button>
              </Link>
            </div>
          </div>

          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} lg={6}>
              <div className="bg-surface p-5 lg:p-7 rounded-[24px] lg:rounded-[32px] border border-border transition-all hover:border-brand/30 h-full">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl bg-brand-soft flex items-center justify-center text-brand">
                    <Package className="w-5 h-5 lg:w-6 lg:h-6" />
                  </div>
                  <span className="text-muted font-bold uppercase tracking-wider text-[10px] lg:text-[11px]">Total Shops</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl lg:text-4xl font-black text-foreground tracking-tight">{totalShopkeepers}</span>
                  <span className="text-xs lg:text-sm font-semibold text-muted">accounts</span>
                </div>
                <div className="mt-3 flex items-center gap-2 text-accent font-bold text-[10px] lg:text-xs bg-emerald-500/10 w-fit px-2.5 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                  Verified
                </div>
              </div>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <div className="bg-surface p-5 lg:p-7 rounded-[24px] lg:rounded-[32px] border border-border transition-all hover:border-accent/30 h-full">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl bg-emerald-500/10 flex items-center justify-center text-accent">
                    <TrendingUp className="w-5 h-5 lg:w-6 lg:h-6" />
                  </div>
                  <span className="text-muted font-bold uppercase tracking-wider text-[10px] lg:text-[11px]">Active vs Inactive</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl lg:text-4xl font-black text-foreground tracking-tight">{activeShops}</span>
                  <span className="text-xs lg:text-sm font-semibold text-muted">/ {inactiveShops} inactive</span>
                </div>
                <div className="mt-3 text-muted font-bold text-[10px] lg:text-xs">
                  Overall platform status
                </div>
              </div>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <div className="bg-surface p-5 lg:p-7 rounded-[24px] lg:rounded-[32px] border border-border transition-all hover:border-amber-500/30 h-full">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                    <IndianRupee className="w-5 h-5 lg:w-6 lg:h-6" />
                  </div>
                  <span className="text-muted font-bold uppercase tracking-wider text-[10px] lg:text-[11px]">Today Sales</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl lg:text-4xl font-black text-foreground tracking-tight">₹{todaySalesAll.toLocaleString('en-IN')}</span>
                </div>
                <div className="mt-3 text-muted font-bold text-[10px] lg:text-xs">
                  Aggregate sales today
                </div>
              </div>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <div className="bg-surface p-5 lg:p-7 rounded-[24px] lg:rounded-[32px] border border-border transition-all hover:border-rose-500/30 h-full">
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl flex items-center justify-center ${expiringSoon > 0 ? 'bg-rose-500/10 text-rose-500' : 'bg-surface-muted text-muted'}`}>
                    <Clock className="w-5 h-5 lg:w-6 lg:h-6" />
                  </div>
                  <span className="text-muted font-bold uppercase tracking-wider text-[10px] lg:text-[11px]">Expiring Soon</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className={`text-3xl lg:text-4xl font-black tracking-tight ${expiringSoon > 0 ? 'text-rose-500' : 'text-foreground'}`}>{expiringSoon}</span>
                  <span className="text-xs lg:text-sm font-semibold text-muted">critical</span>
                </div>
                <div className="mt-3 text-muted font-bold text-[10px] lg:text-xs">
                  Payments due in 48h
                </div>
              </div>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <Card 
                title={<span className="text-lg lg:text-xl font-bold text-foreground tracking-tight">Action Center</span>}
                variant="borderless"
                className="rounded-[24px] lg:rounded-[32px] border border-border h-full"
              >
                <div className="grid grid-cols-2 gap-3 lg:gap-4">
                  <Link href="/admin/users" className="group">
                    <div className="p-4 lg:p-5 rounded-2xl border border-border bg-surface-muted group-hover:bg-brand-soft group-hover:border-brand/30 transition-all h-full">
                      <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-xl bg-surface flex items-center justify-center mb-3 text-muted group-hover:text-brand transition-colors">
                        <PlusCircle className="w-4 h-4 lg:w-5 lg:h-5" />
                      </div>
                      <span className="block font-bold text-foreground text-xs lg:text-sm">Create New Shop</span>
                      <span className="text-[10px] lg:text-[11px] text-muted font-medium">Onboard a new client</span>
                    </div>
                  </Link>
                  <Link href="/admin/users" className="group">
                    <div className="p-4 lg:p-5 rounded-2xl border border-border bg-surface-muted group-hover:bg-emerald-500/10 group-hover:border-accent/30 transition-all h-full">
                      <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-xl bg-surface flex items-center justify-center mb-3 text-muted group-hover:text-accent transition-colors">
                        <LayoutDashboard className="w-4 h-4 lg:w-5 lg:h-5" />
                      </div>
                      <span className="block font-bold text-foreground text-xs lg:text-sm">Manage Shops</span>
                      <span className="text-[10px] lg:text-[11px] text-muted font-medium">Reset passwords & access</span>
                    </div>
                  </Link>
                </div>
                <div className="mt-6 p-4 lg:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex gap-3 lg:gap-4">
                  <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                  <p className="text-[11px] lg:text-xs text-amber-600/80 font-medium leading-relaxed">
                    Use shop management to reset passwords, suspend shops, and update permissions for security.
                  </p>
                </div>
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card 
                title={<span className="text-lg lg:text-xl font-bold text-foreground tracking-tight">System Alerts</span>}
                variant="borderless"
                className="rounded-[24px] lg:rounded-[32px] border border-border"
              >
                <List
                  size="small"
                  dataSource={inactiveShopList}
                  locale={{ emptyText: <span className="text-muted">No inactive shops currently</span> }}
                  renderItem={(item) => (
                    <List.Item className="px-0 py-3 lg:py-4 border-b border-border last:border-0">
                      <div className="flex items-center justify-between w-full gap-2">
                        <div className="min-w-0">
                          <div className="font-bold text-foreground text-sm truncate">
                            {item.shopName ?? "Shop"}
                          </div>
                          <div className="text-[10px] lg:text-[11px] text-muted font-bold uppercase truncate">
                            Owner: {item.name ?? "Unknown"} • {item.phone ?? "No phone"}
                          </div>
                        </div>
                        <Tag color="rgba(225, 29, 72, 0.1)" className="border-none rounded-full px-2 lg:px-3 py-0.5 font-bold text-[9px] lg:text-[10px] text-rose-600 shrink-0">
                          SUSPENDED
                        </Tag>
                      </div>
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
          </Row>
        </>
      ) : (
        <>
          {/* Shopkeeper Header */}
          <div className="bg-surface rounded-[24px] lg:rounded-[32px] p-5 lg:p-8 border border-border flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
            <div className="absolute -right-20 top-6 h-56 w-56 rounded-full bg-brand/5 blur-3xl" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-muted font-bold uppercase tracking-[0.2em] text-[9px] lg:text-[10px]">Merchant Dashboard</span>
              </div>
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground tracking-tight">Welcome back, {welcomeName}</h1>
              <p className="text-muted text-sm lg:text-base font-medium mt-1">
                Your inventory is ready. You have <span className="text-rose-500 font-bold">{lowStockCount} items</span> requiring attention.
              </p>
            </div>
            <div className="flex gap-2 lg:gap-3 relative z-10">
              <Link href="/products" className="flex-1 md:flex-none">
                <Button 
                  type="primary" 
                  icon={<PlusCircle className="w-4 h-4" />}
                  size="large"
                  className="h-10 lg:h-12 w-full px-4 lg:px-6 rounded-xl lg:rounded-2xl font-bold bg-brand hover:bg-brand-strong border-none shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
                >
                  New Product
                </Button>
              </Link>
              <Link href="/insights" className="flex-1 md:flex-none">
                <Button 
                  icon={<LineChart className="w-4 h-4" />}
                  size="large"
                  className="h-10 lg:h-12 w-full px-4 lg:px-6 rounded-xl lg:rounded-2xl font-bold border-border hover:border-gray-300 hover:bg-surface-muted flex items-center justify-center gap-2"
                >
                  Analytics
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats Grid */}
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} lg={6}>
              <div className="bg-surface p-5 lg:p-7 rounded-[24px] lg:rounded-[32px] border border-border transition-all hover:shadow-md h-full">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl bg-brand-soft flex items-center justify-center text-brand">
                    <Package className="w-5 h-5 lg:w-6 lg:h-6" />
                  </div>
                  <span className="text-muted font-bold uppercase tracking-wider text-[10px] lg:text-[11px]">Total SKUs</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl lg:text-4xl font-black text-foreground tracking-tight">{loading ? "--" : totalProducts}</span>
                  <span className="text-xs lg:text-sm font-semibold text-muted">products</span>
                </div>
                <div className="mt-3 flex items-center gap-2 text-accent font-bold text-[10px] lg:text-xs bg-emerald-500/10 w-fit px-2.5 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                  Active Catalog
                </div>
              </div>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <div className="bg-surface p-5 lg:p-7 rounded-[24px] lg:rounded-[32px] border border-border transition-all hover:shadow-md h-full">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl bg-emerald-500/10 flex items-center justify-center text-accent">
                    <Database className="w-5 h-5 lg:w-6 lg:h-6" />
                  </div>
                  <span className="text-muted font-bold uppercase tracking-wider text-[10px] lg:text-[11px]">In-Stock Units</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl lg:text-4xl font-black text-foreground tracking-tight">{loading ? "--" : totalQuantity}</span>
                  <span className="text-xs lg:text-sm font-semibold text-muted">total units</span>
                </div>
                <div className="mt-3 text-muted font-bold text-[10px] lg:text-xs">
                  Physical inventory count
                </div>
              </div>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <div className="bg-surface p-5 lg:p-7 rounded-[24px] lg:rounded-[32px] border border-border transition-all hover:shadow-md h-full">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                    <IndianRupee className="w-5 h-5 lg:w-6 lg:h-6" />
                  </div>
                  <span className="text-muted font-bold uppercase tracking-wider text-[10px] lg:text-[11px]">Daily Sales</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl lg:text-4xl font-black text-foreground tracking-tight">₹{loading ? "--" : salesToday.toLocaleString('en-IN')}</span>
                </div>
                <div className="mt-3 text-accent font-bold text-[10px] lg:text-xs flex items-center gap-1">
                  <ArrowUpRight className="w-3 h-3" />
                  Today&apos;s Revenue
                </div>
              </div>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <div className="bg-surface p-5 lg:p-7 rounded-[24px] lg:rounded-[32px] border border-border transition-all hover:shadow-md h-full">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-600">
                    <TrendingUp className="w-5 h-5 lg:w-6 lg:h-6" />
                  </div>
                  <span className="text-muted font-bold uppercase tracking-wider text-[10px] lg:text-[11px]">Monthly Revenue</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl lg:text-4xl font-black text-foreground tracking-tight">₹{loading ? "--" : salesMonth.toLocaleString('en-IN')}</span>
                </div>
                <div className="mt-3 text-muted font-bold text-[10px] lg:text-xs">
                  Current month aggregate
                </div>
              </div>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col xs={24} lg={16}>
              <Card 
                title={<span className="text-lg lg:text-xl font-bold text-foreground tracking-tight">Recent Inventory Additions</span>}
                variant="borderless"
                className="rounded-[24px] lg:rounded-[32px] border border-border overflow-hidden"
                extra={<Link href="/products" className="text-brand font-bold text-xs lg:text-sm hover:text-brand-strong">Manage All <ArrowUpRight className="w-3 h-3 inline ml-1" /></Link>}
              >
                <div className="mt-2 overflow-x-auto rounded-2xl border border-border">
                  <div className="min-w-[500px]">
                    <div className="grid grid-cols-[110px,1.2fr,0.8fr,0.4fr] gap-3 bg-surface-muted px-4 lg:px-5 py-3 lg:py-4 text-[9px] lg:text-[10px] font-bold uppercase tracking-widest text-muted">
                      <span>Code</span>
                      <span>Product</span>
                      <span>Price</span>
                      <span>Qty</span>
                    </div>
                    <div className="divide-y divide-border text-xs lg:text-sm text-foreground">
                      {recentProducts.length ? (
                        recentProducts.map((product) => (
                          <div
                            key={product.id}
                            className="grid grid-cols-[110px,1.2fr,0.8fr,0.4fr] gap-3 px-4 lg:px-5 py-3 lg:py-4 items-center hover:bg-surface-muted transition-colors"
                          >
                            <span className="font-bold text-foreground text-[11px] lg:text-xs tracking-tighter">
                              {product.sku}
                            </span>
                            <span className="font-medium truncate">{product.name}</span>
                            <span className="font-bold text-foreground">₹{Number(product.price).toLocaleString("en-IN")}</span>
                            <span className={`font-bold ${product.quantity <= 5 ? 'text-rose-500' : 'text-foreground'}`}>
                              {product.quantity}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="px-5 py-8 text-sm text-muted text-center font-medium bg-surface">
                          No products yet. Add your first product to start tracking.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            </Col>

            <Col xs={24} lg={8}>
              <Card 
                title={<span className="text-lg lg:text-xl font-bold text-foreground tracking-tight">Stock Health</span>} 
                variant="borderless"
                className="rounded-[24px] lg:rounded-[32px] border border-border h-full"
              >
                <div className="space-y-6 lg:space-y-8">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-muted font-bold uppercase text-[9px] lg:text-[10px] tracking-wider">Inventory Health</span>
                      <span className="font-black text-foreground text-base lg:text-lg">
                        {totalProducts === 0
                          ? "0%"
                          : `${Math.max(0, Math.round(((totalProducts - lowStockCount) / totalProducts) * 100))}%`}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-surface-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-brand transition-all duration-500"
                        style={{
                          width: `${totalProducts === 0 ? 0 : Math.max(0, Math.round(((totalProducts - lowStockCount) / totalProducts) * 100))}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-muted font-bold uppercase text-[9px] lg:text-[10px] tracking-wider">Daily Contribution</span>
                      <span className="font-black text-foreground text-base lg:text-lg">
                        {salesMonth > 0 ? `${Math.min(100, Math.round((salesToday / salesMonth) * 100))}%` : "0%"}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-surface-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-accent transition-all duration-500"
                        style={{
                          width: `${Math.min(100, salesMonth > 0 ? Math.round((salesToday / salesMonth) * 100) : 0)}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="p-4 lg:p-5 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex gap-3 lg:gap-4">
                    <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />
                    <div>
                      <span className="block font-bold text-rose-700 text-[10px] lg:text-xs mb-1">Restock Alert</span>
                      <p className="text-[10px] lg:text-[11px] text-rose-600/80 font-medium leading-relaxed">
                        Keep low-stock items above 5 units to avoid missed sales opportunities.
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </Col>
          </Row>

        </>
      )}
    </div>
  );
}
