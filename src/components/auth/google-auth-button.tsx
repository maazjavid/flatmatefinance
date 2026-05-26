"use client";

import { useState } from "react";
import { signIn } from "@/auth";
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
          const result = await signIn("google", {
            callbackUrl,
            redirect: false,
          });

          if (result?.error) {
            onError?.("Google sign-in failed. Please try again.");
            return;
          }

          if (result?.url) {
            window.location.href = result.url;
          }
        } finally {
          setIsSubmitting(false);
        }
      }}
    >
      Continue with Google
    </Button>
  );
}

