import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type FlatDetailsCardProps = {
  createdByName: string;
  createdAtLabel: string;
  memberCount: number;
  className?: string;
};

export function FlatDetailsCard({
  createdByName,
  createdAtLabel,
  memberCount,
  className,
}: FlatDetailsCardProps) {
  const rows: Array<{ label: string; value: string }> = [
    { label: "Created by", value: createdByName },
    { label: "Created", value: createdAtLabel },
    { label: "Members", value: String(memberCount) },
  ];

  return (
    <Card className={cn("flex flex-col gap-4", className)}>
      <CardHeader>
        <CardTitle>Flat details</CardTitle>
        <CardDescription>Basic information about this flat.</CardDescription>
      </CardHeader>

      <dl className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex flex-col gap-1 rounded-[6px] border border-surface-border bg-surface-page px-4 py-3"
          >
            <dt className="text-xs uppercase tracking-wide text-ink-muted">{row.label}</dt>
            <dd className="text-sm font-medium text-ink-strong">{row.value}</dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}
