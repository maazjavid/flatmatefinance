"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check, Copy } from "lucide-react";
import { useState } from "react";

export type CopyButtonProps = {
  value: string;
  label?: string;
  className?: string;
};

export function CopyButton({ value, label = "Copy Code", className }: CopyButtonProps) {
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

  return (
    <Button
      type="button"
      variant="ghost"
      onClick={handleCopy}
      aria-live="polite"
      className={cn(
        "h-11 gap-2 rounded-[6px] border border-surface-border bg-surface text-sm font-medium text-ink-strong",
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
