import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import ShopSettingsClient from "@/components/shop-settings-client";

export default async function SettingsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role === "ADMIN") {
    redirect("/admin/settings");
  }

  return (
    <ShopSettingsClient
      user={{
        name: session.user.name ?? null,
        email: session.user.email ?? null,
        shopName: session.user.shopName ?? null,
        phone: session.user.phone ?? null,
        address: session.user.address ?? null,
      }}
    />
  );
}
