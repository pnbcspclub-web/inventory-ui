"use client";

import { useMemo } from "react";
import { Layout, Menu, Typography, Button, Dropdown, Badge, Avatar } from "antd";
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
              label: <Link href="/admin/users?filter=expiring">Expiring Users</Link>,
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
              label: <Link href="/products">Inventory</Link>,
            },
            {
              key: "/insights",
              icon: <ClockCircleOutlined />,
              label: <Link href="/insights">Insights</Link>,
            },
            {
              key: "/notifications",
              icon: <BellOutlined />,
              label: <Link href="/notifications">Notifications</Link>,
            },
            {
              key: "/settings",
              icon: <SettingOutlined />,
              label: <Link href="/settings">Settings</Link>,
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

  return (
    <Layout className="h-screen overflow-hidden" hasSider>
      <Sider
        width={260}
        theme="light"
        breakpoint="lg"
        collapsedWidth={0}
        className="h-full border-r border-border z-30"
      >
        <div className="flex h-full flex-col w-[260px] overflow-y-auto overflow-x-hidden">
          <div className="flex items-center gap-3 p-6 overflow-hidden">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand text-lg font-bold text-white shadow-sm">
              {appName[0]}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-black uppercase tracking-wider text-foreground truncate">
                {appName}
              </div>
              <div className="text-[9px] font-bold uppercase tracking-[0.1em] text-muted opacity-80 truncate">
                Powered by Nexorva
              </div>
            </div>
          </div>

          <Menu
            mode="inline"
            selectedKeys={[activeKey]}
            items={items}
            className="flex-1 mt-2"
          />

          <div className="p-6 mt-auto border-t border-border/60">
            <Button
              className="w-full justify-start gap-3 h-10 px-4 text-muted hover:text-brand transition-colors font-medium border-none shadow-none"
              type="text"
              icon={<LogoutOutlined />}
              onClick={() => signOut({ callbackUrl: "/login" })}
            >
              Sign Out
            </Button>
          </div>
        </div>
      </Sider>

      <Layout className="h-full flex flex-col overflow-hidden">
        <Header className="z-20 flex-shrink-0 flex justify-between items-center bg-surface px-10 border-b border-border shadow-none h-16">
          <Typography.Text className="uppercase text-[11px] font-black tracking-[0.15em] text-muted/80 ml-2">
            {isAdmin ? "Admin Control" : "Shop Terminal"}
          </Typography.Text>

          <div className="flex items-center gap-4">
            <Button
              type="text"
              className="text-muted hover:text-brand flex items-center justify-center"
              icon={themeMode === "dark" ? <SunOutlined /> : <MoonOutlined />}
              onClick={toggle}
            />
            
            <Dropdown menu={{ items: menuItems }} placement="bottomRight" trigger={["click"]}>
              <div className="flex items-center gap-2 cursor-pointer py-1 px-2 rounded-xl transition-all">
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-bold text-foreground leading-none mb-1">
                    {user.name ?? "User"}
                  </div>
                  <div className="text-[10px] text-accent font-bold uppercase tracking-tight leading-none">
                    Online
                  </div>
                </div>
                
                <Badge dot color="#22c55e" offset={[-3, 31]} size="small">
                  <Avatar 
                    className="bg-brand-soft text-brand font-bold border border-brand/10 shadow-sm" 
                    size={36}
                  >
                    {initials}
                  </Avatar>
                </Badge>
                <DownOutlined className="text-[10px] text-muted opacity-60" />
              </div>
            </Dropdown>
          </div>
        </Header>

        <Content className="flex-1 overflow-y-auto p-10 bg-background scroll-smooth">
          <div className="max-w-[1600px] mx-auto">
            {children}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}
