import { isPrismaBuildPhase, prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  if (isPrismaBuildPhase()) {
    return NextResponse.json({ status: "ok", database: "skipped-at-build" });
  }

  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ status: "ok", database: "connected" });
  } catch {
    return NextResponse.json(
      { status: "error", database: "disconnected" },
      { status: 503 },
    );
  }
}
