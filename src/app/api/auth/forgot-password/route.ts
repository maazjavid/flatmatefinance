import { NextResponse } from "next/server";
import { z } from "zod";
import { getAppUrl, getEmailFromAddress } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";
import jwt from "jsonwebtoken";

const ForgotPasswordSchema = z.object({
  email: z.string().email(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = ForgotPasswordSchema.parse(body);

    const normalizedEmail = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    // Avoid account enumerations.
    if (!user) {
      return NextResponse.json({ ok: true });
    }

    // Forgot password is only for local email/password accounts.
    if (!user.passwordHash) {
      return NextResponse.json(
        { ok: false, error: "This account uses Google sign-in." },
        { status: 400 },
      );
    }

    const authSecret = process.env.AUTH_SECRET;
    if (!authSecret) {
      return NextResponse.json(
        { ok: false, error: "Server misconfiguration: missing AUTH_SECRET." },
        { status: 500 },
      );
    }

    const resetToken = jwt.sign(
      { sub: user.id, email: user.email },
      authSecret,
      { expiresIn: "1h" },
    );

    const appUrl = getAppUrl();
    if (!appUrl) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Server misconfiguration: missing NEXT_PUBLIC_APP_URL / AUTH_URL / NEXTAUTH_URL.",
        },
        { status: 500 },
      );
    }

    const resetUrl = `${appUrl}/reset-password?token=${encodeURIComponent(
      resetToken,
    )}`;

    const resendApiKey = process.env.RESEND_API_KEY;
    const resendFrom = getEmailFromAddress();
    if (!resendApiKey || !resendFrom) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Server misconfiguration: missing RESEND_API_KEY and EMAIL_FROM (or RESEND_FROM_EMAIL).",
        },
        { status: 500 },
      );
    }

    const resend = new Resend(resendApiKey);

    const { data, error } = await resend.emails.send({
      from: resendFrom,
      to: user.email,
      subject: "Reset your FlatMate Settle password",
      html: `
        <p>You requested a password reset.</p>
        <p><a href="${resetUrl}">Reset your password</a></p>
        <p>This link expires in 1 hour.</p>
      `,
      text: `You requested a password reset. Reset it here: ${resetUrl}`,
    });

    if (error) {
      console.error("[/api/auth/forgot-password] Resend error:", error);
      return NextResponse.json(
        { ok: false, error: "Failed to send reset link." },
        { status: 500 },
      );
    }

    console.info("[/api/auth/forgot-password] email sent:", data?.id);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[/api/auth/forgot-password] error:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to send reset link." },
      { status: 500 },
    );
  }
}

