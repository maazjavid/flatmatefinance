"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CopyButton } from "@/components/flat/copy-button";
import { ShareInviteButton } from "@/components/flat/share-invite-button";
import { CheckCircle2, PartyPopper } from "lucide-react";
import { useRouter } from "next/navigation";

export type FlatCreatedViewProps = {
  flatId: string;
  flatName: string;
  inviteCode: string;
};

/**
 * Full-page success state shown after a flat is created — Figma node 162:2.
 * Rendered by `/flats/[flatId]?created=1`. "Go to Flat" clears the query param.
 */
export function FlatCreatedView({ flatId, flatName, inviteCode }: FlatCreatedViewProps) {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-6">
      <div
        className="flex items-center gap-2 text-base font-semibold text-ink-strong"
        data-node-id="162:2"
        data-name="Flat Created Status"
      >
        <CheckCircle2 className="size-5 text-primary" aria-hidden strokeWidth={2} />
        Flat Created
      </div>

      <Card className="flex flex-col items-center gap-5 px-8 py-10 text-center">
        <div className="flex size-14 items-center justify-center rounded-full bg-primary-light text-primary">
          <PartyPopper className="size-7" aria-hidden strokeWidth={1.75} />
        </div>

        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-bold text-ink-strong">{flatName}</h2>
          <p className="text-sm text-ink-muted">
            Your flat is ready. Share the invite code with your flatmates.
          </p>
        </div>

        <hr className="w-full max-w-xs border-surface-line" />

        <div className="flex items-center gap-4">
          <span className="text-sm text-ink-muted">Invite code</span>
          <code
            className="rounded-md bg-primary-light px-3 py-1.5 font-mono text-sm font-bold tracking-[0.12em] text-primary-dark"
            aria-label={`Invite code for ${flatName}`}
          >
            {inviteCode}
          </code>
        </div>

        <div className="flex items-center gap-3">
          <CopyButton value={inviteCode} variant="link" />
          <span className="text-ink-subtle" aria-hidden>
            |
          </span>
          <ShareInviteButton
            flatId={flatId}
            flatName={flatName}
            inviteCode={inviteCode}
            variant="link"
          />
        </div>

        <hr className="w-full max-w-xs border-surface-line" />

        <Button
          type="button"
          onClick={() => router.replace(`/flats/${flatId}`)}
          className="h-11 w-full max-w-xs rounded-md border-primary text-sm font-semibold"
        >
          Go to Flat
        </Button>
      </Card>
    </div>
  );
}
