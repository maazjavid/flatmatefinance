import { NextResponse } from "next/server";
import { z } from "zod";
import { requireSession } from "@/lib/api/auth-guard";
import { FlatServiceError } from "@/lib/services/flats";
import { createRentCharge } from "@/lib/services/rent";

const CreateRentSchema = z.object({
  amountDollars: z.number().positive("Enter a valid amount."),
  dueDate: z.string().optional().nullable(),
  label: z.string().max(120).optional().nullable(),
});

export async function POST(
  req: Request,
  context: { params: Promise<{ flatId: string }> },
) {
  const guard = await requireSession();
  if (guard.response) return guard.response;

  const { flatId } = await context.params;

  try {
    const body = await req.json();
    const parsed = CreateRentSchema.parse(body);
    const amountCents = Math.round(parsed.amountDollars * 100);

    const balances = await createRentCharge(guard.session.userId, flatId, {
      amountCents,
      dueDate: parsed.dueDate ?? null,
      label: parsed.label ?? null,
    });

    return NextResponse.json({ ok: true, balances });
  } catch (error) {
    if (error instanceof FlatServiceError) {
      return NextResponse.json({ ok: false, error: error.message }, { status: error.status });
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { ok: false, error: error.issues[0]?.message ?? "Invalid input." },
        { status: 400 },
      );
    }
    console.error(`[POST /api/flats/${flatId}/rent] error:`, error);
    return NextResponse.json({ ok: false, error: "Failed to add rent." }, { status: 500 });
  }
}
