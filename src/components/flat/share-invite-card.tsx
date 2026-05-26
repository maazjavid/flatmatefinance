import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CopyButton } from "@/components/flat/copy-button";
import { ShareInviteButton } from "@/components/flat/share-invite-button";
import { cn } from "@/lib/utils";

export type ShareInviteCardProps = {
  flatName: string;
  inviteCode: string;
  className?: string;
  /** Optional helper text shown above the invite code (e.g. on the "flat created" success state). */
  helper?: string;
};

export function ShareInviteCard({
  flatName,
  inviteCode,
  className,
  helper,
}: ShareInviteCardProps) {
  return (
    <Card className={cn("flex flex-col gap-5", className)}>
      <CardHeader>
        <CardTitle>Invite Code</CardTitle>
        <CardDescription>
          {helper ?? "Share this code with your flatmates so they can join."}
        </CardDescription>
      </CardHeader>

      <div className="flex items-center justify-between gap-3 rounded-[6px] border border-dashed border-surface-border bg-surface-page px-4 py-4">
        <code
          className="font-mono text-xl font-semibold tracking-[0.18em] text-ink-strong"
          aria-label={`Invite code for ${flatName}`}
        >
          {inviteCode}
        </code>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <CopyButton value={inviteCode} className="flex-1" />
        <ShareInviteButton flatName={flatName} inviteCode={inviteCode} className="flex-1" />
      </div>
    </Card>
  );
}
