import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PUT(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "SHOPKEEPER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (
    session.user.shopStatus === "SUSPENDED" ||
    (session.user.shopExpiry && new Date(session.user.shopExpiry) < new Date())
  ) {
    return NextResponse.json({ error: "Shop access suspended" }, { status: 403 });
  }

  const body = (await req.json()) as {
    currentPassword?: string;
    newPassword?: string;
  };

  if ((!session.user.mustChangePassword && !body.currentPassword) || !body.newPassword) {
    return NextResponse.json(
      { error: "Current password and new password are required" },
      { status: 400 }
    );
  }

  if (body.newPassword.length < 6) {
    return NextResponse.json({ error: "New password too short" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { passwordHash: true },
  });

  if (!user?.passwordHash) {
    return NextResponse.json({ error: "Password update unavailable" }, { status: 400 });
  }

  if (session.user.mustChangePassword) {
    const matchesExisting = await bcrypt.compare(body.newPassword, user.passwordHash);
    if (matchesExisting) {
      return NextResponse.json(
        { error: "New password must be different from the temporary password" },
        { status: 400 }
      );
    }
  } else {
    const isValid = await bcrypt.compare(body.currentPassword!, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
    }
  }

  const passwordHash = await bcrypt.hash(body.newPassword, 10);
  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      passwordHash,
      mustChangePassword: false,
    },
  });

  return NextResponse.json({ ok: true });
}
