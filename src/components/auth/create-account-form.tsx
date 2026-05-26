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

export type CreateAccountFormProps = {
  className?: string;
  callbackUrl: string;
};

export function CreateAccountForm({ className, callbackUrl }: CreateAccountFormProps) {
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
          const firstName = String(formData.get("firstName") ?? "").trim();
          const lastName = String(formData.get("lastName") ?? "").trim();
          const email = String(formData.get("email") ?? "").trim().toLowerCase();
          const password = String(formData.get("password") ?? "");
          const confirmPassword = String(formData.get("confirmPassword") ?? "");

          if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
          }

          const result = await signIn("credentials", {
            action: "signup",
            firstName,
            lastName,
            email,
            password,
            confirmPassword,
            callbackUrl,
            redirect: false,
          });

          if (result?.error) {
            setError("Could not create account. Please try again.");
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
      data-node-id="146:37"
      data-name="Groups"
    >
      <div className="mb-8 text-center">
        <h2
          className="text-[35px] font-bold leading-tight text-ink-strong"
          data-node-id="146:55"
        >
          Create Account
        </h2>
        <p className="mt-3 text-xl text-ink-subtitle" data-node-id="146:54">
          Get started by creating your account.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <Label htmlFor="first-name" data-node-id="146:53">
            First Name
          </Label>
          <Input
            id="first-name"
            name="firstName"
            type="text"
            placeholder="Alex"
            defaultValue=""
            data-node-id="146:49"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="last-name" data-node-id="146:53">
            Last Name
          </Label>
          <Input
            id="last-name"
            name="lastName"
            type="text"
            placeholder="Chen"
            defaultValue=""
            data-node-id="146:49"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="create-email" data-node-id="146:52">
            Email
          </Label>
          <Input
            id="create-email"
            name="email"
            type="email"
            placeholder="you@example.com"
            defaultValue=""
            data-node-id="146:48"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label
            htmlFor="create-password"
            className="text-ink-soft"
            data-node-id="146:47"
          >
            Password
          </Label>
          <PasswordInput
            id="create-password"
            name="password"
            defaultValue=""
            data-node-id="146:46"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label
            htmlFor="confirm-password"
            className="text-ink-soft"
            data-node-id="146:44"
          >
            Confirm Password
          </Label>
          <PasswordInput
            id="confirm-password"
            name="confirmPassword"
            defaultValue=""
            data-node-id="146:43"
          />
        </div>
      </div>

      <Button
        type="submit"
        className="mt-8 h-[62px] w-full rounded-[6px] border-primary py-0 text-[22px] font-normal"
        disabled={isSubmitting}
        data-node-id="146:41"
      >
        Create Account
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
          data-node-id="146:199"
        >
          {error}
        </p>
      ) : null}

      <p className="text-center text-[21px] text-ink-secondary" data-node-id="146:39">
        Already have an account?{" "}
        <Link
          href={`/sign-in?next=${encodeURIComponent(callbackUrl)}`}
          className="font-medium text-primary"
          data-node-id="146:42"
        >
          Sign In
        </Link>
      </p>
    </form>
  );
}
