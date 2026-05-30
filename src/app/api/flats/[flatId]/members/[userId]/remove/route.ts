import { NextResponse } from "next/server";
import { requireSession } from "@/lib/api/auth-guard";
import { FlatServiceError } from "@/lib/services/flats";
import { removeFlatMember } from "@/lib/services/rent";

export async function POST(
  _req: Request,
  context: { params: Promise<{ flatId: string; userId: string }> },
) {
  const guard = await requireSession();
  if (guard.response) return guard.response;

  const { flatId, userId: targetUserId } = await context.params;

  try {
    const balances = await removeFlatMember(guard.session.userId, flatId, targetUserId);
    return NextResponse.json({ ok: true, balances });
  } catch (error) {
    if (error instanceof FlatServiceError) {
      return NextResponse.json({ ok: false, error: error.message }, { status: error.status });
    }
    console.error(`[POST /api/flats/${flatId}/members/${targetUserId}/remove] error:`, error);
    return NextResponse.json(
      { ok: false, error: "Failed to remove member." },
      { status: 500 },
    );
  }
}
