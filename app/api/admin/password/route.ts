import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PUT(req: Request) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const body = await req.json();
  if (!body.password || body.password.length < 6) {
    return NextResponse.json({ error: "Password too short" }, { status: 400 });
  }
  const passwordHash = await bcrypt.hash(body.password, 10);
  await prisma.user.update({
    where: { id: session.user.id },
    data: { passwordHash },
  });
  return NextResponse.json({ ok: true });
}
