import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      ownerId?: string | null;
      role: "ADMIN" | "SHOPKEEPER";
      userCode?: string | null;
      address?: string | null;
      phone?: string | null;
      shopName?: string | null;
      shopStatus?: "ACTIVE" | "SUSPENDED";
      shopExpiry?: string | null;
      mustChangePassword?: boolean;
      name?: string | null;
      email?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    ownerId?: string | null;
    role?: "ADMIN" | "SHOPKEEPER";
    uid?: string;
    userCode?: string | null;
    address?: string | null;
    phone?: string | null;
    shopName?: string | null;
    shopStatus?: "ACTIVE" | "SUSPENDED";
    shopExpiry?: string | null;
    mustChangePassword?: boolean;
  }
}
