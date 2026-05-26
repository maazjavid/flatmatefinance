"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useState } from "react";

export type ForgotPasswordFormProps = {
  className?: string;
};

export function ForgotPasswordForm({ className }: ForgotPasswordFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <form
      className={cn("flex w-full flex-col", className)}
      onSubmit={async (event) => {
        event.preventDefault();
        setError(null);
        setSuccess(null);
        setIsSubmitting(true);

        try {
          const formData = new FormData(event.currentTarget);
          const email = String(formData.get("email") ?? "").trim();

          const res = await fetch("/api/auth/forgot-password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
          });

          const data: { ok?: boolean; error?: string } = await res.json();

          if (!res.ok || data.ok === false) {
            setError(data.error ?? "Failed to send reset link.");
            return;
          }

          // Avoid account enumeration: the API returns `ok: true` even if the user doesn't exist.
          setSuccess(
            "If an account exists, we sent a reset link to your email.",
          );
        } catch {
          setError("Failed to send reset link.");
        } finally {
          setIsSubmitting(false);
        }
      }}
      data-node-id="148:79"
      data-name="Groups"
    >
      <div className="mb-8 text-center">
        <h2 className="text-[35px] font-bold leading-tight text-ink-strong">
          Forgot Password?
        </h2>
        <p className="mt-3 text-xl text-ink-subtitle">
          Enter your email and we&apos;ll send you a link to reset your password.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <Label htmlFor="forgot-email">Email</Label>
          <Input
            id="forgot-email"
            name="email"
            type="email"
            placeholder="you@example.com"
            defaultValue=""
          />
        </div>
      </div>

      <Button
        type="submit"
        className="mt-8 h-[62px] w-full rounded-[6px] border-primary py-0 text-[22px] font-normal"
        disabled={isSubmitting}
      >
        Send Reset Link
      </Button>

      <div
        className="my-10 h-[3px] w-full rounded-full bg-surface-line"
        role="separator"
      />

      {error ? (
        <p
          className="mb-2 text-center text-lg font-medium text-danger"
          role="alert"
          aria-live="polite"
        >
          {error}
        </p>
      ) : null}

      {success ? (
        <p
          className="mb-2 text-center text-lg font-medium text-ink"
          role="status"
          aria-live="polite"
        >
          {success}
        </p>
      ) : null}

      <p className="text-center text-[21px] text-ink-secondary">
        Remember your password?{" "}
        <Link href="/sign-in" className="font-medium text-primary">
          Sign In
        </Link>
      </p>
    </form>
  );
}
