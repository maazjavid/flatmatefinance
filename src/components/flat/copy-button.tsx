"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check, Copy } from "lucide-react";
import { useState } from "react";

export type CopyButtonProps = {
  value: string;
  label?: string;
  className?: string;
  /** "button" — outlined pill button. "link" — text-only inline action. */
  variant?: "button" | "link";
};

export function CopyButton({
  value,
  label = "Copy Code",
  className,
  variant = "button",
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  if (variant === "link") {
    return (
      <button
        type="button"
        onClick={handleCopy}
        aria-live="polite"
        className={cn(
          "inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-sm font-medium text-primary transition-colors",
          "hover:bg-primary-light/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
          className,
        )}
      >
        {copied ? (
          <Check className="size-4" aria-hidden strokeWidth={1.75} />
        ) : (
          <Copy className="size-4" aria-hidden strokeWidth={1.75} />
        )}
        {copied ? "Copied" : label}
      </button>
    );
  }

  return (
    <Button
      type="button"
      variant="ghost"
      onClick={handleCopy}
      aria-live="polite"
      className={cn(
        "h-10 gap-2 rounded-md border border-surface-border bg-surface text-sm font-medium text-ink-strong",
        className,
      )}
    >
      {copied ? (
        <Check className="size-4 text-primary" aria-hidden strokeWidth={1.75} />
      ) : (
        <Copy className="size-4" aria-hidden strokeWidth={1.75} />
      )}
      {copied ? "Copied" : label}
    </Button>
  );
}
