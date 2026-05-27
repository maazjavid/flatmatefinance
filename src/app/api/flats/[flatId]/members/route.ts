import { NextResponse } from "next/server";
import { requireSession } from "@/lib/api/auth-guard";
import { FlatServiceError, getFlatMembers } from "@/lib/services/flats";

/**
 * GET /api/flats/:flatId/members → list members for the flat home screen.
 *
 * Split from `GET /api/flats/:flatId` so the UI can refresh just the members
 * list (e.g. after someone joins) without re-fetching the entire flat.
 */
export async function GET(
  _req: Request,
  context: { params: Promise<{ flatId: string }> },
) {
  const guard = await requireSession();
  if (guard.response) return guard.response;

  const { flatId } = await context.params;

  try {
    const result = await getFlatMembers(guard.session.userId, flatId);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof FlatServiceError) {
      return NextResponse.json({ ok: false, error: error.message }, { status: error.status });
    }
    console.error(`[GET /api/flats/${flatId}/members] error:`, error);
    return NextResponse.json(
      { ok: false, error: "Failed to load members." },
      { status: 500 },
    );
  }
}
