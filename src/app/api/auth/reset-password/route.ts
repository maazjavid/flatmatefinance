import { NextResponse } from "next/server";
import { z } from "zod";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/auth/reset-password
 *
 * Verifies the JWT issued by `/api/auth/forgot-password` and updates the
 * user's password. Same secret (`AUTH_SECRET`) signs and verifies the token,
 * so no extra DB tables are needed.
 */

const ResetSchema = z.object({
  token: z.string().min(10, "Invalid reset token."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

type ResetTokenPayload = { sub: string; email: string };

export async function POST(req: Request) {
  let parsed: z.infer<typeof ResetSchema>;
  try {
    const body = await req.json();
    parsed = ResetSchema.parse(body);
  } catch (error) {
    const message =
      error instanceof z.ZodError
        ? (error.issues[0]?.message ?? "Invalid input.")
        : "Invalid input.";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }

  const authSecret = process.env.AUTH_SECRET;
  if (!authSecret) {
    return NextResponse.json(
      { ok: false, error: "Server misconfiguration: missing AUTH_SECRET." },
      { status: 500 },
    );
  }

  let payload: ResetTokenPayload;
  try {
    payload = jwt.verify(parsed.token, authSecret) as ResetTokenPayload;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Reset link is invalid or has expired." },
      { status: 400 },
    );
  }

  if (!payload.sub || !payload.email) {
    return NextResponse.json(
      { ok: false, error: "Reset link is invalid." },
      { status: 400 },
    );
  }

  try {
    const passwordHash = await bcrypt.hash(parsed.password, 10);
    await prisma.user.update({
      where: { id: payload.sub },
      data: { passwordHash },
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[/api/auth/reset-password] error:", error);
    return NextResponse.json(
      { ok: false, error: "Could not reset password." },
      { status: 500 },
    );
  }
}
