import { NextResponse } from "next/server";
import type { Session } from "next-auth";

type AuthenticatedSession = Session & {
  user: NonNullable<Session["user"]>;
};

type ActiveShopkeeperSession = AuthenticatedSession & {
  user: AuthenticatedSession["user"] & {
    role: "SHOPKEEPER";
  };
};

export function isShopAccessBlocked(session: Session) {
  if (session.user.role !== "SHOPKEEPER") {
    return false;
  }

  if (session.user.shopStatus === "SUSPENDED") {
    return true;
  }

  if (!session.user.shopExpiry) {
    return false;
  }

  return new Date(session.user.shopExpiry) < new Date();
}

export function guardActiveShopkeeper(session: Session | null) {
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "SHOPKEEPER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (isShopAccessBlocked(session)) {
    return NextResponse.json({ error: "Shop access suspended" }, { status: 403 });
  }

  return null;
}

export function requireActiveShopkeeper(session: Session | null): {
  response: NextResponse | null;
  session: ActiveShopkeeperSession | null;
} {
  const response = guardActiveShopkeeper(session);

  if (response) {
    return { response, session: null };
  }

  return {
    response: null,
    session: session as ActiveShopkeeperSession,
  };
}
