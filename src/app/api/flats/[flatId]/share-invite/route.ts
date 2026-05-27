import { NextResponse } from "next/server";
import { requireSession } from "@/lib/api/auth-guard";
import { FlatServiceError, recordShareInvite } from "@/lib/services/flats";

/**
 * POST /api/flats/:flatId/share-invite → register a share event for analytics
 * and (in Phase 2) re-issue the invite code if it has expired.
 *
 * Today this is a no-op; the UI calls `navigator.share` / clipboard directly.
 * Hitting this endpoint after that is what tells the backend "this user just
 * shared", which Phase 2 will use to update audit/event records.
 */
export async function POST(
  _req: Request,
  context: { params: Promise<{ flatId: string }> },
) {
  const guard = await requireSession();
  if (guard.response) return guard.response;

  const { flatId } = await context.params;

  try {
    const result = await recordShareInvite(guard.session.userId, flatId);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof FlatServiceError) {
      return NextResponse.json({ ok: false, error: error.message }, { status: error.status });
    }
    console.error(`[POST /api/flats/${flatId}/share-invite] error:`, error);
    return NextResponse.json(
      { ok: false, error: "Failed to record share." },
      { status: 500 },
    );
  }
}
