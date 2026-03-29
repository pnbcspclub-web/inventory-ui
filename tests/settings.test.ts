import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaMock = vi.hoisted(() => ({
  appSetting: {
    findFirst: vi.fn(),
    create: vi.fn(),
  },
}));

vi.mock("@/lib/prisma", () => ({
  prisma: prismaMock,
}));

vi.mock("@/lib/app-config", () => ({
  APP_NAME: "Inventory Cloud",
  APP_DESCRIPTION: "Stock, orders, and insights",
}));

describe("app settings cache", () => {
  beforeEach(() => {
    vi.resetModules();
    prismaMock.appSetting.findFirst.mockReset();
    prismaMock.appSetting.create.mockReset();
  });

  it("caches the settings result until TTL", async () => {
    prismaMock.appSetting.findFirst
      .mockResolvedValueOnce({
        id: "settings-1",
        appName: "db-name",
        appDescription: "db-description",
        maintenanceMode: false,
        updatedAt: new Date("2026-03-26T00:00:00.000Z"),
      })
      .mockResolvedValueOnce({
        id: "settings-1",
        appName: "db-name",
        appDescription: "db-description",
        maintenanceMode: true,
        updatedAt: new Date("2026-03-26T00:01:00.000Z"),
      });

    const settingsModule = await import("@/lib/settings");

    const first = await settingsModule.getAppSettings();
    const cached = await settingsModule.getAppSettings();

    expect(first.maintenanceMode).toBe(false);
    expect(cached.maintenanceMode).toBe(false);
    expect(prismaMock.appSetting.findFirst).toHaveBeenCalledTimes(1);
  });
});
