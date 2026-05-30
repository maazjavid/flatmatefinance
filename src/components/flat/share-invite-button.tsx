"use client";

import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";
import {
  buildShareInviteMessage,
  resolveClientAppUrl,
} from "@/lib/flat-invite-link";
import { cn } from "@/lib/utils";

export type ShareInviteButtonProps = {
  flatId: string;
  flatName: string;
  inviteCode: string;
  className?: string;
  /** "button" — filled green button. "link" — text-only inline action. */
  variant?: "button" | "link";
};

export function ShareInviteButton({
  flatId,
  flatName,
  inviteCode,
  className,
  variant = "button",
}: ShareInviteButtonProps) {
  async function handleShare() {
    const shareText = buildShareInviteMessage(flatName, inviteCode, resolveClientAppUrl());
    const nav = typeof window !== "undefined" ? window.navigator : undefined;

    if (nav?.share) {
      try {
        await nav.share({
          title: `Join ${flatName} on FlatMate Finance`,
          text: shareText,
        });
      } catch {
        try {
          await nav?.clipboard?.writeText?.(shareText);
        } catch {
          // No-op.
        }
      }
    } else {
      try {
        await nav?.clipboard?.writeText?.(shareText);
      } catch {
        // No-op.
      }
    }

    void fetch(`/api/flats/${flatId}/share-invite`, { method: "POST" }).catch(() => {});
  }

  if (variant === "link") {
    return (
      <button
        type="button"
        onClick={handleShare}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-sm font-medium text-primary transition-colors",
          "hover:bg-primary-light/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
          className,
        )}
      >
        <Share2 className="size-4" aria-hidden strokeWidth={1.75} />
        Share Invite
      </button>
    );
  }

  return (
    <Button
      type="button"
      onClick={handleShare}
      className={cn(
        "h-10 gap-2 rounded-md border-primary px-4 text-sm font-semibold",
        className,
      )}
    >
      <Share2 className="size-4" aria-hidden strokeWidth={1.75} />
      Share Invite
    </Button>
  );
}
