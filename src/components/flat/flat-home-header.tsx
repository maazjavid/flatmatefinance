import { ShareInviteButton } from "@/components/flat/share-invite-button";
import { cn } from "@/lib/utils";

export type FlatHomeHeaderProps = {
  flatId: string;
  flatName: string;
  inviteCode: string;
  className?: string;
};

/** Page header row above the flat summary card: title + Share Invite button. */
export function FlatHomeHeader({
  flatId,
  flatName,
  inviteCode,
  className,
}: FlatHomeHeaderProps) {
  return (
    <div
      className={cn("flex items-center justify-between gap-4", className)}
      data-node-id="57:2"
      data-name="Flat Home Header"
    >
      <h1 className="text-2xl font-bold text-ink-strong">{flatName}</h1>
      <ShareInviteButton flatId={flatId} flatName={flatName} inviteCode={inviteCode} />
    </div>
  );
}
