import { Card } from "@/components/ui/card";
import { CopyButton } from "@/components/flat/copy-button";
import { ShareInviteButton } from "@/components/flat/share-invite-button";
import { cn } from "@/lib/utils";

export type FlatSummaryCardProps = {
  flatId: string;
  flatName: string;
  memberCount: number;
  inviteCode: string;
  className?: string;
};

/**
 * Top card on the Flat Home page — Figma node 57:2.
 * Shows flat name, member count, and an inline invite-code row with
 * Copy / Share actions.
 */
export function FlatSummaryCard({
  flatId,
  flatName,
  memberCount,
  inviteCode,
  className,
}: FlatSummaryCardProps) {
  return (
    <Card className={cn("flex flex-col gap-5 px-6 py-6", className)}>
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold text-ink-strong">{flatName}</h2>
        <p className="text-sm text-ink-muted">
          {memberCount} {memberCount === 1 ? "member" : "members"}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <div className="flex items-center gap-3">
          <span className="text-sm text-ink-muted">Invite code</span>
          <code
            className="rounded-md bg-primary-light px-3 py-1.5 font-mono text-sm font-bold tracking-[0.12em] text-primary-dark"
            aria-label={`Invite code for ${flatName}`}
          >
            {inviteCode}
          </code>
        </div>

        <div className="flex items-center gap-1">
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
      </div>
    </Card>
  );
}
