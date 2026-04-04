"use client";

import { useMemo, useState } from "react";
import { Layout, Menu, Button, Dropdown, Badge, Avatar, Drawer } from "antd";
import {
  AppstoreOutlined,
  TeamOutlined,
  SettingOutlined,
  AlertOutlined,
  DownOutlined,
  PlusCircleOutlined,
  ClockCircleOutlined,
  BellOutlined,
  MoonOutlined,
  SunOutlined,
  LogoutOutlined,
  MenuOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useSearchParams } from "next/navigation";
import { signOut } from "next-auth/react";
import { useTheme } from "@/components/theme-provider";

const { Header, Content, Sider } = Layout;

type AppShellProps = {
  children: React.ReactNode;
  user: {
    id?: string | null;
    name?: string | null;
    email?: string | null;
    role?: string | null;
  };
  appName: string;
};

export default function AppShell({ children, user, appName }: AppShellProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isAdmin = user.role === "ADMIN";
  const { mode: themeMode, toggle } = useTheme();
  const mode = searchParams.get("mode");
  const filter = searchParams.get("filter");
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false);

  const activeKey = useMemo(() => {
    if (!isAdmin) return pathname;
    if (pathname !== "/admin/users") return pathname;
    if (mode === "create") return "/admin/users?mode=create";
    if (filter === "expiring") return "/admin/users?filter=expiring";
    return "/admin/users";
  }, [filter, isAdmin, mode, pathname]);

  const items = useMemo(
    () =>
      isAdmin
        ? [
            {
              key: "/admin/dashboard",
              icon: <AppstoreOutlined />,
              label: <Link href="/admin/dashboard" onClick={() => setMobileMenuVisible(false)}>Dashboard</Link>,
            },
            {
              key: "/admin/users",
              icon: <TeamOutlined />,
              label: <Link href="/admin/users" onClick={() => setMobileMenuVisible(false)}>All Users</Link>,
            },
            {
              key: "/admin/users?mode=create",
              icon: <PlusCircleOutlined />,
              label: <Link href="/admin/users?mode=create" onClick={() => setMobileMenuVisible(false)}>Create New User</Link>,
            },
            {
              key: "/admin/users?filter=expiring",
              icon: <ClockCircleOutlined />,
              label: <Link href="/admin/users?filter=expiring" onClick={() => setMobileMenuVisible(false)}>Expiring Users</Link>,
            },
            {
              key: "/admin/notifications",
              icon: <BellOutlined />,
              label: <Link href="/admin/notifications" onClick={() => setMobileMenuVisible(false)}>Notifications</Link>,
            },
            {
              key: "/admin/settings",
              icon: <SettingOutlined />,
              label: <Link href="/admin/settings" onClick={() => setMobileMenuVisible(false)}>App Settings</Link>,
            },
          ]
        : [
            {
              key: "/dashboard",
              icon: <AppstoreOutlined />,
              label: <Link href="/dashboard" onClick={() => setMobileMenuVisible(false)}>Dashboard</Link>,
            },
            {
              key: "/products",
              icon: <AlertOutlined />,
              label: <Link href="/products" onClick={() => setMobileMenuVisible(false)}>Inventory</Link>,
            },
            {
              key: "/insights",
              icon: <ClockCircleOutlined />,
              label: <Link href="/insights" onClick={() => setMobileMenuVisible(false)}>Insights</Link>,
            },
            {
              key: "/notifications",
              icon: <BellOutlined />,
              label: <Link href="/notifications" onClick={() => setMobileMenuVisible(false)}>Notifications</Link>,
            },
            {
              key: "/settings",
              icon: <SettingOutlined />,
              label: <Link href="/settings" onClick={() => setMobileMenuVisible(false)}>Settings</Link>,
            },
          ],
    [isAdmin]
  );

  const initials = (user.name ?? user.email ?? "U")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const menuItems = [
    {
      key: "signout",
      label: "Sign out",
      onClick: () => signOut({ callbackUrl: "/login" }),
    },
  ];

  const SidebarContent = (
    <div className="invent-shell__sidebar flex h-full flex-col overflow-y-auto overflow-x-hidden">
      <div className="flex items-center gap-3 overflow-hidden px-6 py-7">
        <div className="invent-shell__logo shrink-0" aria-hidden="true">
          <Image src="/vercel.svg" alt="" width={42} height={42} className="h-10 w-10 object-contain" />
        </div>
        <div className="min-w-0">
          <div className="truncate text-sm font-black uppercase tracking-[0.14em] text-foreground">
            {appName}
          </div>
          <div className="truncate text-[10px] font-bold uppercase tracking-[0.16em] text-muted opacity-80">
            Powered by Nexorva
          </div>
        </div>
      </div>

      <Menu
        mode="inline"
        selectedKeys={[activeKey]}
        items={items}
        className="invent-shell__menu mt-2 flex-1"
      />

      <div className="mt-auto border-t border-border/60 p-6">
        <Button
          className="h-11 w-full justify-start gap-3 rounded-2xl px-4 text-muted transition-colors font-medium border-none shadow-none"
          type="text"
          icon={<LogoutOutlined />}
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          Sign Out
        </Button>
      </div>
    </div>
  );

  return (
    <Layout className="h-screen overflow-hidden" hasSider>
      {/* Desktop Sider */}
      <Sider
        width={260}
        theme={themeMode === "dark" ? "dark" : "light"}
        breakpoint="lg"
        collapsedWidth={0}
        trigger={null}
        className="hidden h-full border-r border-border z-30 lg:block"
        style={{ background: "var(--surface)" }}
      >
        {SidebarContent}
      </Sider>

      {/* Mobile Drawer */}
      <Drawer
        placement="left"
        onClose={() => setMobileMenuVisible(false)}
        open={mobileMenuVisible}
        width={260}
        styles={{ body: { padding: 0 } }}
        style={{ background: "var(--surface)" }}
        closable={false}
      >
        {SidebarContent}
      </Drawer>

      <Layout className="h-full flex flex-col overflow-hidden">
        <Header
          className="flex h-18 flex-shrink-0 items-center justify-between border-b border-border px-4 shadow-none lg:px-10"
          style={{ background: "var(--surface)", lineHeight: 1 }}
        >
          <div className="flex items-center gap-4">
            <Button
              type="text"
              icon={<MenuOutlined />}
              onClick={() => setMobileMenuVisible(true)}
              className="h-11 w-11 rounded-2xl text-muted lg:hidden"
            />
          </div>

          <div className="flex items-center gap-2 lg:gap-4">
            <Button
              type="text"
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border bg-surface text-muted hover:text-brand"
              icon={themeMode === "dark" ? <SunOutlined /> : <MoonOutlined />}
              onClick={toggle}
            />
            
            <Dropdown menu={{ items: menuItems }} placement="bottomRight" trigger={["click"]}>
              <div className="flex cursor-pointer items-center gap-3 rounded-2xl border border-transparent px-1 py-1 transition-all hover:border-border hover:bg-surface-muted/80 lg:px-2">
                <div className="hidden text-right sm:block">
                  <div className="mb-1 text-xs font-bold leading-none text-foreground">
                    {user.name ?? "User"}
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.18em] leading-none text-accent">
                    Online
                  </div>
                </div>
                
                <Badge dot color="#22c55e" offset={[-3, 31]} size="small">
                  <Avatar 
                    className="border border-brand/10 bg-brand-soft font-bold text-brand shadow-sm" 
                    size={36}
                  >
                    {initials}
                  </Avatar>
                </Badge>
                <DownOutlined className="hidden text-[10px] text-muted opacity-60 lg:block" />
              </div>
            </Dropdown>
          </div>
        </Header>

        <Content className="flex-1 overflow-y-auto bg-background p-4 scroll-smooth lg:p-8 xl:p-10">
          <div className="mx-auto max-w-[1540px]">
            {children}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}
