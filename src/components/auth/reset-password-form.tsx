"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { cn } from "@/lib/utils";
import { useState } from "react";

export type ResetPasswordFormProps = {
  className?: string;
  token: string;
};

export function ResetPasswordForm({ className, token }: ResetPasswordFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <form
      className={cn("flex w-full flex-col", className)}
      onSubmit={async (event) => {
        event.preventDefault();
        setError(null);
        setSuccess(false);
        setIsSubmitting(true);

        try {
          const formData = new FormData(event.currentTarget);
          const password = String(formData.get("password") ?? "");
          const confirmPassword = String(formData.get("confirmPassword") ?? "");

          if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
          }

          const res = await fetch("/api/auth/reset-password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token, password }),
          });
          const data: { ok?: boolean; error?: string } = await res
            .json()
            .catch(() => ({}));

          if (!res.ok || data.ok === false) {
            setError(data.error ?? "Could not reset password.");
            return;
          }
          setSuccess(true);
        } catch {
          setError("Could not reset password.");
        } finally {
          setIsSubmitting(false);
        }
      }}
    >
      <div className="mb-8 text-center">
        <h2 className="text-[35px] font-bold leading-tight text-ink-strong">
          Reset Password
        </h2>
        <p className="mt-3 text-xl text-ink-subtitle">
          Choose a new password for your account.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <Label htmlFor="reset-password" className="text-ink-soft">
            New password
          </Label>
          <PasswordInput id="reset-password" name="password" defaultValue="" />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="reset-confirm" className="text-ink-soft">
            Confirm new password
          </Label>
          <PasswordInput id="reset-confirm" name="confirmPassword" defaultValue="" />
        </div>
      </div>

      <Button
        type="submit"
        disabled={isSubmitting || success}
        className="mt-8 h-[58px] w-full rounded-[6px] border-primary py-0 text-lg font-semibold"
      >
        {success ? "Password updated" : "Update password"}
      </Button>

      <div className="my-10 h-[3px] w-full rounded-full bg-surface-line" role="separator" />

      {error ? (
        <p
          className="mb-2 text-center text-base font-medium text-danger"
          role="alert"
          aria-live="polite"
        >
          {error}
        </p>
      ) : null}

      {success ? (
        <p
          className="mb-2 text-center text-base font-medium text-ink"
          role="status"
          aria-live="polite"
        >
          Your password has been updated. You can now{" "}
          <Link href="/sign-in" className="font-semibold text-primary">
            sign in
          </Link>
          .
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
