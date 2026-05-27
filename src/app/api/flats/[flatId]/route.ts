import { NextResponse } from "next/server";
import { requireSession } from "@/lib/api/auth-guard";
import { FlatServiceError, getFlatById } from "@/lib/services/flats";

/**
 * GET /api/flats/:flatId → flat details + members for the flat home screen.
 *
 * Currently returns the mock fixture regardless of `flatId`. Phase 2 will
 * authorise that the requesting user is actually a member.
 */
export async function GET(
  _req: Request,
  context: { params: Promise<{ flatId: string }> },
) {
  const guard = await requireSession();
  if (guard.response) return guard.response;

  const { flatId } = await context.params;

  try {
    const result = await getFlatById(guard.session.userId, flatId);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof FlatServiceError) {
      return NextResponse.json({ ok: false, error: error.message }, { status: error.status });
    }
    console.error(`[GET /api/flats/${flatId}] error:`, error);
    return NextResponse.json(
      { ok: false, error: "Failed to load flat." },
      { status: 500 },
    );
  }
}
