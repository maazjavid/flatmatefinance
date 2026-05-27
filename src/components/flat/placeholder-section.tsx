import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";

export type PlaceholderSectionProps = {
  title: string;
  description: string;
  icon: LucideIcon;
};

/**
 * Used by the dashboard sub-pages (Expenses / Settlements / Reports) that are
 * intentionally not built yet. Keeps the sidebar nav usable without revealing
 * unfinished work.
 */
export function PlaceholderSection({ title, description, icon: Icon }: PlaceholderSectionProps) {
  return (
    <Card className="flex flex-col items-center gap-3 py-12 text-center">
      <div className="flex size-10 items-center justify-center rounded-full bg-primary-light text-primary">
        <Icon className="size-5" strokeWidth={1.75} aria-hidden />
      </div>
      <CardHeader className="mb-0 items-center">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
    </Card>
  );
}
