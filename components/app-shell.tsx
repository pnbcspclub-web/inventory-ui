"use client";

import { useEffect, useMemo, useState } from "react";
import { Layout, Menu, Typography, Button, Dropdown, Modal } from "antd";
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
} from "@ant-design/icons";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { signOut } from "next-auth/react";
import { useTheme } from "@/components/theme-provider";

const { Header, Content, Sider } = Layout;

type AppShellProps = {
  children: React.ReactNode;
  user: {
    name?: string | null;
    email?: string | null;
    role?: string | null;
    address?: string | null;
    phone?: string | null;
    shopName?: string | null;
  };
  appName: string;
};

export default function AppShell({ children, user, appName }: AppShellProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isAdmin = user.role === "ADMIN";
  const [profileOpen, setProfileOpen] = useState(false);
  const { mode: themeMode, toggle, setMode } = useTheme();
  const mode = searchParams.get("mode");
  const filter = searchParams.get("filter");

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
              label: <Link href="/admin/dashboard">Dashboard</Link>,
            },
            {
              key: "/admin/users",
              icon: <TeamOutlined />,
              label: <Link href="/admin/users">All Users</Link>,
            },
            {
              key: "/admin/users?mode=create",
              icon: <PlusCircleOutlined />,
              label: <Link href="/admin/users?mode=create">Create New User</Link>,
            },
            {
              key: "/admin/users?filter=expiring",
              icon: <ClockCircleOutlined />,
              label: (
                <Link href="/admin/users?filter=expiring&days=2">
                  Expiring Users
                </Link>
              ),
            },
            {
              key: "/admin/notifications",
              icon: <BellOutlined />,
              label: <Link href="/admin/notifications">Notifications</Link>,
            },
            {
              key: "/admin/settings",
              icon: <SettingOutlined />,
              label: <Link href="/admin/settings">App Settings</Link>,
            },
          ]
        : [
            {
              key: "/dashboard",
              icon: <AppstoreOutlined />,
              label: <Link href="/dashboard">Dashboard</Link>,
            },
            {
              key: "/products",
              icon: <AlertOutlined />,
              label: <Link href="/products">Products</Link>,
            },
            {
              key: "/notifications",
              icon: <BellOutlined />,
              label: <Link href="/notifications">Notifications</Link>,
            },
          ],
    [isAdmin]
  );

  const pageTitle = useMemo(() => {
    if (pathname === "/admin/users") return "Shop Management";
    if (pathname === "/admin/settings") return "Settings";
    if (pathname === "/admin/dashboard") return "Admin Dashboard";
    if (pathname === "/admin/notifications") return "Notifications";
    if (pathname === "/products") return "Products";
    if (pathname === "/orders") return "Orders";
    if (pathname === "/notifications") return "Notifications";
    if (pathname === "/dashboard") return "Dashboard";
    return "Dashboard";
  }, [pathname]);

  const sidebarTitle = isAdmin
    ? appName
    : user.shopName ?? user.name ?? "Shopkeeper";

  useEffect(() => {
    if (!isAdmin && themeMode !== "light") {
      setMode("light");
    }
  }, [isAdmin, setMode, themeMode]);
  const menuItems = [
    {
      key: "profile",
      label: "Profile",
      onClick: () => setProfileOpen(true),
    },
    {
      key: "signout",
      label: "Sign out",
      onClick: () => signOut({ callbackUrl: "/login" }),
    },
  ];

  return (
    <Layout className="min-h-screen app-background app-shell">
      <Sider
        width={252}
        breakpoint="lg"
        collapsedWidth={0}
        className="app-sider"
      >
        <div className="flex h-full flex-col">
          <div className="px-6 pt-7 pb-5">
            <Typography.Title level={4} className="!mb-1">
              {sidebarTitle}
            </Typography.Title>
          </div>
          <Menu
            mode="inline"
            selectedKeys={[activeKey]}
            items={items}
            className="app-menu border-0 bg-transparent px-3"
          />
          <div className="mt-auto border-t border-black/5 px-6 py-4">
            <div className="text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-muted)]">
              Signed in as
            </div>
            <div className="mt-1 text-sm font-semibold">{user.name ?? "User"}</div>
            <div className="text-xs text-[color:var(--color-muted)]">
              {user.email}
            </div>
          </div>
        </div>
      </Sider>
      <Layout>
        <Header className="app-topbar">
          <div className="app-topbar-inner">
            <Typography.Title level={4} className="!mb-0">
              {pageTitle}
            </Typography.Title>
            <div className="flex items-center gap-2">
              {isAdmin ? (
                <Button
                  className="app-user-btn"
                  onClick={toggle}
                  aria-label="Toggle dark mode"
                >
                  {themeMode === "dark" ? <SunOutlined /> : <MoonOutlined />}
                  <span className="hidden sm:inline">
                    {themeMode === "dark" ? "Light" : "Dark"}
                  </span>
                </Button>
              ) : null}
              <Dropdown menu={{ items: menuItems }} placement="bottomRight" trigger={["click"]}>
                <Button className="app-user-btn">
                  {user.name ?? "User"} <DownOutlined />
                </Button>
              </Dropdown>
            </div>
          </div>
        </Header>
        <Content className="pb-10">
          <div className="app-content">{children}</div>
        </Content>
      </Layout>
      <Modal
        open={profileOpen}
        onCancel={() => setProfileOpen(false)}
        footer={null}
        title="Profile"
      >
        <div className="space-y-2 text-sm">
          {!isAdmin ? (
            <div>
              <div className="text-[color:var(--color-muted)]">Shop Name</div>
              <div className="font-semibold">{user.shopName ?? "--"}</div>
            </div>
          ) : null}
          <div>
            <div className="text-[color:var(--color-muted)]">Name</div>
            <div className="font-semibold">{user.name ?? "User"}</div>
          </div>
          <div>
            <div className="text-[color:var(--color-muted)]">Email</div>
            <div className="font-semibold">{user.email ?? "--"}</div>
          </div>
          <div>
            <div className="text-[color:var(--color-muted)]">Role</div>
            <div className="font-semibold">{user.role ?? "SHOPKEEPER"}</div>
          </div>
          <div>
            <div className="text-[color:var(--color-muted)]">Phone</div>
            <div className="font-semibold">{user.phone ?? "--"}</div>
          </div>
          {!isAdmin ? (
            <div>
              <div className="text-[color:var(--color-muted)]">Address</div>
              <div className="font-semibold">{user.address ?? "Address not set"}</div>
            </div>
          ) : null}
        </div>
      </Modal>
    </Layout>
  );
}
