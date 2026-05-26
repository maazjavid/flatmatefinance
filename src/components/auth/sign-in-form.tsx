"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { cn } from "@/lib/utils";
import { signIn } from "@/auth";
import { useState } from "react";
import { AuthDivider } from "@/components/auth/auth-divider";
import { GoogleAuthButton } from "@/components/auth/google-auth-button";

export type SignInFormProps = {
  className?: string;
  callbackUrl: string;
};

export function SignInForm({ className, callbackUrl }: SignInFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <form
      className={cn("flex w-full flex-col", className)}
      onSubmit={async (event) => {
        event.preventDefault();
        setError(null);
        setIsSubmitting(true);

        try {
          const formData = new FormData(event.currentTarget);
          const email = String(formData.get("email") ?? "")
            .trim()
            .toLowerCase();
          const password = String(formData.get("password") ?? "");

          const result = await signIn("credentials", {
            action: "signin",
            email,
            password,
            callbackUrl,
            redirect: false,
          });

          if (result?.error) {
            setError("Invalid email or password.");
            return;
          }

          if (result?.url) {
            window.location.href = result.url;
          } else {
            window.location.href = callbackUrl;
          }
        } finally {
          setIsSubmitting(false);
        }
      }}
      data-node-id="146:9"
      data-name="Groups"
    >
      <div className="mb-8 text-center">
        <h2
          className="text-[35px] font-bold leading-tight text-ink-strong"
          data-node-id="146:27"
        >
          Sign In
        </h2>
        <p className="mt-3 text-xl text-ink-subtitle" data-node-id="146:26">
          Welcome back! Please sign in to your account.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <Label htmlFor="email" data-node-id="146:25">
            Email
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            defaultValue=""
            data-node-id="146:21"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="password" className="text-ink-soft" data-node-id="146:20">
            Password
          </Label>
          <PasswordInput
            id="password"
            name="password"
            defaultValue=""
            data-node-id="146:18"
          />
          <Link
            href="/forgot-password"
            className="self-start text-lg font-semibold text-primary"
            data-node-id="146:16"
          >
            Forgot password?
          </Link>
        </div>
      </div>

      <Button
        type="submit"
        className="mt-8 h-[62px] w-full rounded-[6px] border-primary py-0 text-[22px] font-normal"
        disabled={isSubmitting}
        data-node-id="146:13"
      >
        Sign In
      </Button>

      <AuthDivider />

      <GoogleAuthButton
        callbackUrl={callbackUrl}
        onError={(message) => setError(message)}
        disabled={isSubmitting}
      />

      {error ? (
        <p
          className="mt-4 text-center text-lg font-medium text-danger"
          role="alert"
          aria-live="polite"
          data-node-id="146:99"
        >
          {error}
        </p>
      ) : null}

      <p className="text-center text-[21px] text-ink-secondary" data-node-id="146:11">
        No account?{" "}
        <Link
          href={`/create-account?next=${encodeURIComponent(callbackUrl)}`}
          className="font-medium text-primary"
          data-node-id="146:10"
        >
          Create Account
        </Link>
      </p>
    </form>
  );
}
