import { NextResponse } from "next/server";
import { requireSession } from "@/lib/api/auth-guard";
import { FlatServiceError } from "@/lib/services/flats";
import { sendRentReminder } from "@/lib/services/rent";

export async function POST(
  _req: Request,
  context: { params: Promise<{ flatId: string; splitId: string }> },
) {
  const guard = await requireSession();
  if (guard.response) return guard.response;

  const { flatId, splitId } = await context.params;

  try {
    const balances = await sendRentReminder(guard.session.userId, flatId, splitId);
    return NextResponse.json({ ok: true, balances });
  } catch (error) {
    if (error instanceof FlatServiceError) {
      return NextResponse.json({ ok: false, error: error.message }, { status: error.status });
    }
    console.error(`[POST /api/flats/${flatId}/rent/splits/${splitId}/notify] error:`, error);
    return NextResponse.json(
      { ok: false, error: "Failed to send notification." },
      { status: 500 },
    );
  }
}
