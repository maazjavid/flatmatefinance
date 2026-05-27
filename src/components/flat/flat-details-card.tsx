import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Info } from "lucide-react";

export type FlatDetailsCardProps = {
  createdByName: string;
  createdAtLabel: string;
  inviteStatus: "active" | "inactive";
  className?: string;
};

export function FlatDetailsCard({
  createdByName,
  createdAtLabel,
  inviteStatus,
  className,
}: FlatDetailsCardProps) {
  return (
    <Card className={cn("flex flex-col gap-4", className)}>
      <CardHeader>
        <CardTitle>Flat Details</CardTitle>
      </CardHeader>

      <dl className="flex flex-col divide-y divide-surface-line">
        <DetailRow label="Created by">
          <span className="text-sm font-medium text-ink-strong">{createdByName}</span>
        </DetailRow>
        <DetailRow label="Created on">
          <span className="text-sm font-medium text-ink-strong">{createdAtLabel}</span>
        </DetailRow>
        <DetailRow label="Invite status">
          <Badge variant={inviteStatus === "active" ? "success" : "neutral"}>
            {inviteStatus === "active" ? "Active" : "Inactive"}
          </Badge>
        </DetailRow>
      </dl>

      <div className="flex items-start gap-2 rounded-md bg-surface-page px-3 py-3 text-xs text-ink-soft">
        <Info className="size-4 shrink-0 text-ink-soft" aria-hidden strokeWidth={1.75} />
        <span>Share this code with flatmates to join.</span>
      </div>
    </Card>
  );
}

function DetailRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
      <dt className="text-sm text-ink-muted">{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}
