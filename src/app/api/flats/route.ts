import { NextResponse } from "next/server";
import { z } from "zod";
import { requireSession } from "@/lib/api/auth-guard";
import {
  FlatServiceError,
  createFlatForUser,
  listFlatsForUser,
} from "@/lib/services/flats";

/**
 * GET  /api/flats  → list the flats the authenticated user belongs to.
 * POST /api/flats  → create a flat and add the user as the first admin.
 *
 * Both handlers currently return mock data (see `@/lib/services/flats`).
 * Phase 2 will swap the service body for real Prisma queries — these route
 * handlers don't need to change.
 */

export async function GET() {
  const guard = await requireSession();
  if (guard.response) return guard.response;

  const result = await listFlatsForUser(guard.session.userId);
  return NextResponse.json(result);
}

const CreateFlatSchema = z.object({
  name: z.string().trim().min(1, "Flat name is required.").max(80, "Flat name is too long."),
});

export async function POST(req: Request) {
  const guard = await requireSession();
  if (guard.response) return guard.response;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON." }, { status: 400 });
  }

  const parsed = CreateFlatSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." },
      { status: 400 },
    );
  }

  try {
    const result = await createFlatForUser(guard.session.userId, parsed.data);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof FlatServiceError) {
      return NextResponse.json({ ok: false, error: error.message }, { status: error.status });
    }
    console.error("[POST /api/flats] error:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to create flat." },
      { status: 500 },
    );
  }
}
