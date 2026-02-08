import { prisma } from "@/lib/prisma";
import { APP_DESCRIPTION, APP_NAME } from "@/lib/app-config";
import type { AppSetting } from "@prisma/client";

const SETTINGS_CACHE_TTL_MS = 60_000;
type AppSettings = AppSetting;
let settingsCache: { value: AppSettings; expiresAt: number } | null = null;

export async function getAppSettings() {
  if (settingsCache && Date.now() < settingsCache.expiresAt) {
    return settingsCache.value;
  }
  const existing = await prisma.appSetting.findFirst();
  if (existing) {
    const value = {
      ...existing,
      appName: APP_NAME,
      appDescription: APP_DESCRIPTION,
    };
    settingsCache = { value, expiresAt: Date.now() + SETTINGS_CACHE_TTL_MS };
    return value;
  }
  const created = await prisma.appSetting.create({
    data: {},
  });
  const value = {
    ...created,
    appName: APP_NAME,
    appDescription: APP_DESCRIPTION,
  };
  settingsCache = { value, expiresAt: Date.now() + SETTINGS_CACHE_TTL_MS };
  return value;
}
