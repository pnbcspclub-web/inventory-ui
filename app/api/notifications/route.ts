import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const isAdmin = session.user.role === "ADMIN";
  const notifications = await prisma.notification.findMany({
    where: isAdmin
      ? {}
      : {
          OR: [{ userId: session.user.id }, { userId: null }],
        },
    orderBy: { createdAt: "desc" },
    select: isAdmin
      ? {
          id: true,
          title: true,
          message: true,
          channel: true,
          userId: true,
          createdAt: true,
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              shopName: true,
              email: true,
            },
          },
        }
      : {
          id: true,
          title: true,
          message: true,
          channel: true,
          createdAt: true,
          createdBy: {
            select: {
              name: true,
              email: true,
            },
          },
        },
  });

  return NextResponse.json(notifications);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const message = body.message?.trim();
  const title = body.title?.trim() || null;
  const userId = body.userId ?? null;
  const channel = body.channel?.trim() || "IN_APP";

  if (!message) {
    return NextResponse.json({ error: "Message required" }, { status: 400 });
  }

  const notification = await prisma.notification.create({
    data: {
      title,
      message,
      channel,
      userId,
      createdById: session.user.id,
    },
    select: {
      id: true,
      title: true,
      message: true,
      channel: true,
      userId: true,
      createdAt: true,
    },
  });

  return NextResponse.json(notification, { status: 201 });
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const id = body?.id as string | undefined;
  if (!id) {
    return NextResponse.json({ error: "Notification id required" }, { status: 400 });
  }

  await prisma.notification.delete({
    where: { id },
  });

  return NextResponse.json({ ok: true });
}
