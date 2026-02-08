import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import AppShell from "@/components/app-shell";
import { getAppSettings } from "@/lib/settings";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  if (session.user.role === "ADMIN") {
    redirect("/admin/dashboard");
  }
  if (
    session.user.shopStatus === "SUSPENDED" ||
    (session.user.shopExpiry && new Date(session.user.shopExpiry) < new Date())
  ) {
    redirect("/login");
  }
  const settings = await getAppSettings();
  if (settings.maintenanceMode) {
    redirect("/maintenance");
  }

  return (
    <AppShell user={session.user} appName={settings.appName}>
      {children}
    </AppShell>
  );
}
