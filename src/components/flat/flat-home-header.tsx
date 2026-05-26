import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Users } from "lucide-react";

export type FlatHomeHeaderProps = {
  flatName: string;
  memberCount: number;
  inviteStatus: "active" | "inactive";
  className?: string;
};

export function FlatHomeHeader({
  flatName,
  memberCount,
  inviteStatus,
  className,
}: FlatHomeHeaderProps) {
  return (
    <header
      className={cn("flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between", className)}
      data-node-id="57:2"
      data-name="Flat Home Header"
    >
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-ink-strong sm:text-4xl">{flatName}</h1>
        <div className="flex items-center gap-2 text-ink-soft">
          <Users className="size-4" aria-hidden strokeWidth={1.75} />
          <span className="text-sm">
            {memberCount} {memberCount === 1 ? "member" : "members"}
          </span>
        </div>
      </div>
      <Badge variant={inviteStatus === "active" ? "success" : "neutral"}>
        Invite {inviteStatus}
      </Badge>
    </header>
  );
}
