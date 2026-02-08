import { getAppSettings } from "@/lib/settings";
import { redirect } from "next/navigation";
import LoginShopkeeperClient from "@/components/login-shopkeeper-client";

export default async function LoginSelectorPage() {
  const settings = await getAppSettings();
  if (settings.maintenanceMode) {
    redirect("/maintenance");
  }
  return <LoginShopkeeperClient />;
}
