import { beforeEach, describe, expect, it, vi } from "vitest";

const authMock = vi.hoisted(() => vi.fn());
const getAppSettingsMock = vi.hoisted(() => vi.fn());
const updateMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/auth", () => ({
  auth: authMock,
}));

vi.mock("@/lib/settings", () => ({
  getAppSettings: getAppSettingsMock,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    appSetting: {
      update: updateMock,
    },
  },
}));

describe("PUT /api/settings", () => {
  beforeEach(async () => {
    vi.resetModules();
    authMock.mockReset();
    getAppSettingsMock.mockReset();
    updateMock.mockReset();
  });

  it("invalidates the settings cache after updating maintenance mode", async () => {
    authMock.mockResolvedValue({
      user: { id: "admin-1", role: "ADMIN" },
    });
    getAppSettingsMock.mockResolvedValue({ id: "settings-1" });
    updateMock.mockResolvedValue({
      id: "settings-1",
      maintenanceMode: true,
    });

    const { PUT } = await import("@/app/api/settings/route");
    const response = await PUT(
      new Request("http://localhost/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ maintenanceMode: true }),
      })
    );

    expect(response.status).toBe(200);
    expect(updateMock).toHaveBeenCalledWith({
      where: { id: "settings-1" },
      data: { maintenanceMode: true },
    });
  });
});
