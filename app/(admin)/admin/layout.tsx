import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import AppShell from "@/components/app-shell";
import { getAppSettings } from "@/lib/settings";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/admin/login");
  }
  if (session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }
  const settings = await getAppSettings();

  return <AppShell user={session.user} appName={settings.appName}>{children}</AppShell>;
}
