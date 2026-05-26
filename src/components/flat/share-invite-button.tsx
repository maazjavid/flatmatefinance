"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Share2 } from "lucide-react";

export type ShareInviteButtonProps = {
  flatName: string;
  inviteCode: string;
  className?: string;
};

export function ShareInviteButton({ flatName, inviteCode, className }: ShareInviteButtonProps) {
  async function handleShare() {
    const shareText = `Join my flat "${flatName}" on FlatMate Finance. Invite code: ${inviteCode}`;

    // TODO: Phase 2 — call `POST /api/flats/:flatId/share-invite` to register the share event
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share({ title: "FlatMate Finance invite", text: shareText });
        return;
      } catch {
        // Fall through to clipboard fallback below.
      }
    }
    try {
      await navigator.clipboard.writeText(shareText);
    } catch {
      // No-op — UI feedback is intentionally minimal for MVP.
    }
  }

  return (
    <Button
      type="button"
      onClick={handleShare}
      className={cn(
        "h-11 gap-2 rounded-[6px] border-primary px-4 text-sm font-semibold",
        className,
      )}
    >
      <Share2 className="size-4" aria-hidden strokeWidth={1.75} />
      Share Invite
    </Button>
  );
}
