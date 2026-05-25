"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export type ForgotPasswordFormProps = {
  className?: string;
};

export function ForgotPasswordForm({ className }: ForgotPasswordFormProps) {
  return (
    <form
      className={cn("flex w-full flex-col", className)}
      onSubmit={(event) => {
        event.preventDefault();
      }}
      data-node-id="148:79"
      data-name="Groups"
    >
      <div className="mb-8 text-center">
        <h2 className="text-[35px] font-bold leading-tight text-[#3F454F]">
          Forgot Password?
        </h2>
        <p className="mt-3 text-xl text-[#9B9FAB]">
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
        type="button"
        className="mt-8 h-[62px] w-full rounded-[6px] border-primary py-0 text-[22px] font-normal"
        onClick={() => {}}
      >
        Send Reset Link
      </Button>

      {/* TODO: Phase 2 — wire submit to password-reset API and validate email */}

      <div
        className="my-10 h-[3px] w-full rounded-full bg-[#EAEBEF]"
        role="separator"
      />

      <p className="text-center text-[21px] text-[#858B9A]">
        Remember your password?{" "}
        <Link href="/sign-in" className="font-medium text-primary">
          Sign In
        </Link>
      </p>
    </form>
  );
}
