import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/auth/register
 *
 * Creates a local (email/password) account. Keeping registration in its own
 * route — instead of overloading the NextAuth Credentials `authorize` callback —
 * gives us:
 * - clearer validation errors back to the UI
 * - non-swallowed Prisma errors (Auth.js wraps everything as CallbackRouteError)
 * - a stable place for Phase 2 to add things like email verification.
 *
 * The UI is expected to call `signIn("credentials", { action: "signin", ... })`
 * immediately after a 200 response to establish the session.
 */

const RegisterSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required."),
  lastName: z.string().trim().min(1, "Last name is required."),
  email: z.string().trim().toLowerCase().email("Enter a valid email."),
  password: z.string().min(8, "Password must be at least 8 characters."),
  confirmPassword: z.string(),
});

export async function POST(req: Request) {
  let parsed: z.infer<typeof RegisterSchema>;
  try {
    const body = await req.json();
    parsed = RegisterSchema.parse(body);
  } catch (error) {
    const message =
      error instanceof z.ZodError
        ? (error.issues[0]?.message ?? "Invalid input.")
        : "Invalid input.";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }

  if (parsed.password !== parsed.confirmPassword) {
    return NextResponse.json(
      { ok: false, error: "Passwords do not match." },
      { status: 400 },
    );
  }

  const fullName = `${parsed.firstName} ${parsed.lastName}`.trim();
  const passwordHash = await bcrypt.hash(parsed.password, 10);

  try {
    const existing = await prisma.user.findUnique({
      where: { email: parsed.email },
      select: { id: true, passwordHash: true },
    });

    if (existing?.passwordHash) {
      return NextResponse.json(
        {
          ok: false,
          error: "An account with this email already exists. Try signing in.",
        },
        { status: 409 },
      );
    }

    // Either no user yet, or a Google-only user (passwordHash === null).
    // In both cases it's safe to upsert and set the local password.
    await prisma.user.upsert({
      where: { email: parsed.email },
      update: { name: fullName, passwordHash },
      create: { email: parsed.email, name: fullName, passwordHash },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    // Surface the real Prisma error to the dev console — the UI gets a generic message.
    console.error("[/api/auth/register] prisma error:", error);
    return NextResponse.json(
      { ok: false, error: "Could not create account. Please try again." },
      { status: 500 },
    );
  }
}
