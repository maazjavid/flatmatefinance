import { NextResponse } from "next/server";
import { z } from "zod";
import { requireSession } from "@/lib/api/auth-guard";
import { FlatServiceError, joinFlatForUser } from "@/lib/services/flats";

/**
 * POST /api/flats/join → join an existing flat using an invite code.
 *
 * Currently returns mock data via `joinFlatForUser`.
 */

const JoinFlatSchema = z.object({
  inviteCode: z
    .string()
    .trim()
    .min(1, "Invite code is required.")
    .max(64, "Invite code is too long."),
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

  const parsed = JoinFlatSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid invite code." },
      { status: 400 },
    );
  }

  try {
    const result = await joinFlatForUser(guard.session.userId, parsed.data);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof FlatServiceError) {
      return NextResponse.json({ ok: false, error: error.message }, { status: error.status });
    }
    console.error("[POST /api/flats/join] error:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to join flat." },
      { status: 500 },
    );
  }
}
