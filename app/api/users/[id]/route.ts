import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import {
  assignCodeToUser,
  getUserCodes,
  removeCodeFromUser,
  serializeUserWithCodes,
} from "@/lib/user-codes";

type Params = { params: Promise<{ id: string }> };

const userInclude = {
  primaryCode: { select: { id: true, value: true } },
  codeAssignments: {
    orderBy: [{ assignedAt: "asc" as const }],
    select: {
      assignedAt: true,
      code: { select: { id: true, value: true } },
    },
  },
};

export async function PUT(req: Request, { params }: Params) {
  const { id } = await params;
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const body = await req.json();
  const nextPasswordHash = body.password
    ? await bcrypt.hash(body.password, 10)
    : undefined;
  const user = await prisma.user.update({
    where: { id },
    data: {
      name: body.name ?? undefined,
      shopName: body.shopName ?? undefined,
      shopStatus: body.shopStatus ?? undefined,
      shopExpiry: body.shopExpiry ? new Date(body.shopExpiry) : undefined,
      address: body.address ?? undefined,
      phone: body.phone ?? undefined,
      passwordHash: nextPasswordHash,
      mustChangePassword:
        body.password ? true : body.mustChangePassword ?? undefined,
    },
    include: userInclude,
  });

  const nextCodes: string[] | null = Array.isArray(body.userCodes)
    ? Array.from(
        new Set(
          body.userCodes
            .map((value: unknown) => String(value ?? "").trim().toUpperCase())
            .filter(Boolean)
        )
      )
    : typeof body.userCode === "string" && body.userCode.trim()
      ? [body.userCode.trim().toUpperCase()]
      : null;

  let nextUser = user;
  if (nextCodes) {
    const currentCodes = await getUserCodes({ ownerId: id, userId: id });
    const desired = new Set(nextCodes);

    for (const code of currentCodes.codes) {
      if (!desired.has(code.value)) {
        nextUser = await removeCodeFromUser({ ownerId: id, userId: id, code: code.value });
      }
    }

    for (const code of nextCodes) {
      nextUser = await assignCodeToUser({
        ownerId: id,
        userId: id,
        code,
        assignedById: session.user.id,
        setPrimary:
          code ===
          String(body.primaryUserCode ?? body.userCode ?? nextCodes[0]).trim().toUpperCase(),
      });
    }
  }

  return NextResponse.json(serializeUserWithCodes(nextUser));
}

export async function DELETE(_: Request, { params }: Params) {
  const { id } = await params;
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
