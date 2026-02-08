import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAppSettings } from "@/lib/settings";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const settings = await getAppSettings();
  return NextResponse.json(settings);
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const body = await req.json();
  const existing = await getAppSettings();
  const updated = await prisma.appSetting.update({
    where: { id: existing.id },
    data: {
      maintenanceMode: Boolean(body.maintenanceMode),
    },
  });
  return NextResponse.json(updated);
}
