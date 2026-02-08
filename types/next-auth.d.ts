import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "ADMIN" | "SHOPKEEPER";
      userCode?: string | null;
      address?: string | null;
      phone?: string | null;
      shopName?: string | null;
      shopStatus?: "ACTIVE" | "SUSPENDED";
      shopExpiry?: string | null;
      name?: string | null;
      email?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: "ADMIN" | "SHOPKEEPER";
    uid?: string;
    userCode?: string | null;
    address?: string | null;
    phone?: string | null;
    shopName?: string | null;
    shopStatus?: "ACTIVE" | "SUSPENDED";
    shopExpiry?: string | null;
  }
}
