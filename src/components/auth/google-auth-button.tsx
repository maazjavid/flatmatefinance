"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type GoogleAuthButtonProps = {
  callbackUrl: string;
  className?: string;
  onError?: (message: string) => void;
  disabled?: boolean;
};

export function GoogleAuthButton({
  callbackUrl,
  className,
  onError,
  disabled,
}: GoogleAuthButtonProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <Button
      type="button"
      variant="ghost"
      disabled={disabled || isSubmitting}
      className={cn(
        "mt-6 h-[62px] w-full rounded-[6px] border border-surface-border bg-surface-muted py-0 text-[22px] font-normal",
        "hover:bg-surface-muted",
        className,
      )}
      onClick={async () => {
        try {
          setIsSubmitting(true);
          // Let NextAuth navigate the browser to Google. For OAuth providers
          // `redirect: false` doesn't make sense — we need the full redirect
          // flow so Google can hand the code back to /api/auth/callback/google.
          await signIn("google", { callbackUrl });
        } catch {
          onError?.("Google sign-in failed. Please try again.");
        } finally {
          setIsSubmitting(false);
        }
      }}
    >
      Continue with Google
    </Button>
  );
}

