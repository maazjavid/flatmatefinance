import { NextResponse } from "next/server";
import { requireSession } from "@/lib/api/auth-guard";
import { FlatServiceError } from "@/lib/services/flats";
import { uploadRentPaymentProof } from "@/lib/services/rent";

export async function POST(
  req: Request,
  context: { params: Promise<{ flatId: string; splitId: string }> },
) {
  const guard = await requireSession();
  if (guard.response) return guard.response;

  const { flatId, splitId } = await context.params;

  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json(
        { ok: false, error: "Choose a file to upload." },
        { status: 400 },
      );
    }

    const balances = await uploadRentPaymentProof(
      guard.session.userId,
      flatId,
      splitId,
      file,
    );

    return NextResponse.json({ ok: true, balances });
  } catch (error) {
    if (error instanceof FlatServiceError) {
      return NextResponse.json({ ok: false, error: error.message }, { status: error.status });
    }
    console.error(`[POST /api/flats/${flatId}/rent/splits/${splitId}/proof] error:`, error);
    return NextResponse.json(
      { ok: false, error: "Failed to upload proof." },
      { status: 500 },
    );
  }
}
