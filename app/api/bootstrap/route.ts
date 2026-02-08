import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const existing = await prisma.user.count();
  if (existing > 0) {
    return NextResponse.json({ error: "Bootstrap already completed" }, { status: 400 });
  }
  const body = await req.json();
  if (!body.email || !body.password) {
    return NextResponse.json({ error: "Email and password required" }, { status: 400 });
  }
  const passwordHash = await bcrypt.hash(body.password, 10);
  const user = await prisma.user.create({
    data: {
      name: body.name ?? "Admin",
      email: body.email.toLowerCase(),
      role: "ADMIN",
      passwordHash,
    },
    select: { id: true, email: true, role: true },
  });
  return NextResponse.json(user, { status: 201 });
}
