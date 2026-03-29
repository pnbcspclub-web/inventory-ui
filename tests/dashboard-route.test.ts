import { beforeEach, describe, expect, it, vi } from "vitest";

const authMock = vi.hoisted(() => vi.fn());
const requireActiveShopkeeperMock = vi.hoisted(() => vi.fn());
const saleAggregateMock = vi.hoisted(() => vi.fn());
const productAggregateMock = vi.hoisted(() => vi.fn());
const productCountMock = vi.hoisted(() => vi.fn());
const productFindManyMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/auth", () => ({
  auth: authMock,
}));

vi.mock("@/lib/session-guards", () => ({
  requireActiveShopkeeper: requireActiveShopkeeperMock,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    sale: {
      aggregate: saleAggregateMock,
    },
    product: {
      aggregate: productAggregateMock,
      count: productCountMock,
      findMany: productFindManyMock,
    },
  },
}));

describe("GET /api/dashboard", () => {
  beforeEach(async () => {
    vi.resetModules();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-26T15:45:12.000Z"));

    authMock.mockReset();
    requireActiveShopkeeperMock.mockReset();
    saleAggregateMock.mockReset();
    productAggregateMock.mockReset();
    productCountMock.mockReset();
    productFindManyMock.mockReset();
  });

  it("uses the start of the current calendar month for salesMonth", async () => {
    authMock.mockResolvedValue({ user: { id: "shop-1" } });
    requireActiveShopkeeperMock.mockReturnValue({
      response: null,
      session: { user: { id: "shop-1" } },
    });
    saleAggregateMock
      .mockResolvedValueOnce({ _sum: { total: 1250 } })
      .mockResolvedValueOnce({ _sum: { total: 9800 } });
    productAggregateMock.mockResolvedValue({
      _count: { _all: 3 },
      _sum: { quantity: 9 },
    });
    productCountMock.mockResolvedValue(1);
    productFindManyMock.mockResolvedValue([]);

    const { GET } = await import("@/app/api/dashboard/route");
    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.salesMonth).toBe(9800);

    expect(saleAggregateMock).toHaveBeenCalledTimes(2);
    const monthCall = saleAggregateMock.mock.calls[1]?.[0];
    expect(monthCall.where.createdById).toBe("shop-1");

    const monthStart = monthCall.where.createdAt.gte as Date;
    expect(monthStart.getFullYear()).toBe(2026);
    expect(monthStart.getMonth()).toBe(2);
    expect(monthStart.getDate()).toBe(1);
    expect(monthStart.getHours()).toBe(0);
    expect(monthStart.getMinutes()).toBe(0);
    expect(monthStart.getSeconds()).toBe(0);
  });
});
