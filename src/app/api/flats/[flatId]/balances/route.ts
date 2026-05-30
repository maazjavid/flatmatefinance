import { NextResponse } from "next/server";
import { requireSession } from "@/lib/api/auth-guard";
import { FlatServiceError } from "@/lib/services/flats";
import { getFlatBalances } from "@/lib/services/rent";

export async function GET(
  _req: Request,
  context: { params: Promise<{ flatId: string }> },
) {
  const guard = await requireSession();
  if (guard.response) return guard.response;

  const { flatId } = await context.params;

  try {
    const balances = await getFlatBalances(guard.session.userId, flatId);
    return NextResponse.json({ balances });
  } catch (error) {
    if (error instanceof FlatServiceError) {
      return NextResponse.json({ ok: false, error: error.message }, { status: error.status });
    }
    console.error(`[GET /api/flats/${flatId}/balances] error:`, error);
    return NextResponse.json(
      { ok: false, error: "Failed to load balances." },
      { status: 500 },
    );
  }
}
