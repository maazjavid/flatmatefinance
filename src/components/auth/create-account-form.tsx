"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { cn } from "@/lib/utils";

export type CreateAccountFormProps = {
  className?: string;
};

export function CreateAccountForm({ className }: CreateAccountFormProps) {
  return (
    <form
      className={cn("flex w-full flex-col", className)}
      onSubmit={(event) => {
        event.preventDefault();
      }}
      data-node-id="146:37"
      data-name="Groups"
    >
      <div className="mb-8 text-center">
        <h2
          className="text-[35px] font-bold leading-tight text-[#3F454F]"
          data-node-id="146:55"
        >
          Create Account
        </h2>
        <p className="mt-3 text-xl text-[#9B9FAB]" data-node-id="146:54">
          Get started by creating your account.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <Label htmlFor="full-name" data-node-id="146:53">
            Full Name
          </Label>
          <Input
            id="full-name"
            name="fullName"
            type="text"
            placeholder="Alex Chen"
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
          <Label htmlFor="create-password" className="text-[#696D76]" data-node-id="146:47">
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
          <Label htmlFor="confirm-password" className="text-[#696D76]" data-node-id="146:44">
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
        type="button"
        className="mt-8 h-[62px] w-full rounded-[6px] border-primary py-0 text-[22px] font-normal"
        onClick={() => {}}
        data-node-id="146:41"
      >
        Create Account
      </Button>

      {/* TODO: Phase 2 — wire form submit to registration API and validate fields */}

      <div
        className="my-10 h-[3px] w-full rounded-full bg-[#EAEBEF]"
        role="separator"
        data-node-id="146:40"
      />

      <p className="text-center text-[21px] text-[#858B9A]" data-node-id="146:39">
        Already have an account?{" "}
        <button
          type="button"
          className="font-medium text-primary"
          onClick={() => {}}
          data-node-id="146:42"
        >
          Sign In
        </button>
      </p>

      {/* TODO: Phase 2 — navigate to sign-in flow */}
    </form>
  );
}
