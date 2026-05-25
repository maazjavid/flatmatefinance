"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { cn } from "@/lib/utils";

export type SignInFormProps = {
  className?: string;
};

export function SignInForm({ className }: SignInFormProps) {

  return (
    <form
      className={cn("flex w-full flex-col", className)}
      onSubmit={(event) => {
        event.preventDefault();
      }}
      data-node-id="146:9"
      data-name="Groups"
    >
      <div className="mb-8 text-center">
        <h2
          className="text-[35px] font-bold leading-tight text-[#3F454F]"
          data-node-id="146:27"
        >
          Sign In
        </h2>
        <p className="mt-3 text-xl text-[#9B9FAB]" data-node-id="146:26">
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
          <Label htmlFor="password" className="text-[#696D76]" data-node-id="146:20">
            Password
          </Label>
          <PasswordInput
            id="password"
            name="password"
            defaultValue=""
            data-node-id="146:18"
          />
          <button
            type="button"
            className="self-start text-lg font-semibold text-primary"
            onClick={() => {}}
            data-node-id="146:16"
          >
            Forgot password?
          </button>
        </div>
      </div>

      <Button
        type="button"
        className="mt-8 h-[62px] w-full rounded-[6px] border-primary py-0 text-[22px] font-normal"
        onClick={() => {}}
        data-node-id="146:13"
      >
        Sign In
      </Button>

      {/* TODO: Phase 2 — wire form submit to auth provider and validate email/password */}

      <div
        className="my-10 h-[3px] w-full rounded-full bg-[#EAEBEF]"
        role="separator"
        data-node-id="146:12"
      />

      <p className="text-center text-[21px] text-[#858B9A]" data-node-id="146:11">
        No account?{" "}
        <button
          type="button"
          className="font-medium text-primary"
          onClick={() => {}}
          data-node-id="146:10"
        >
          Create Account
        </button>
      </p>

      {/* TODO: Phase 2 — navigate to registration flow */}
    </form>
  );
}
