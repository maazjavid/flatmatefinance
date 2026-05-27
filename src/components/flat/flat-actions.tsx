"use client";

import { Button } from "@/components/ui/button";
import { useFlatModals } from "@/components/flat/flat-modals-provider";
import { cn } from "@/lib/utils";
import { Plus, UserPlus } from "lucide-react";

export type FlatActionsProps = {
  className?: string;
};

/** Welcome-card Create / Join buttons — modals live in `FlatModalsProvider`. */
export function FlatActions({ className }: FlatActionsProps) {
  const { openCreateFlat, openJoinFlat } = useFlatModals();

  return (
    <div className={cn("flex w-full flex-col gap-2.5 sm:flex-row sm:justify-center", className)}>
      <Button
        type="button"
        onClick={openCreateFlat}
        className="h-11 flex-1 gap-2 rounded-md border-primary text-sm font-semibold"
      >
        <Plus className="size-4" aria-hidden strokeWidth={1.75} />
        Create Flat
      </Button>
      <Button
        type="button"
        variant="ghost"
        onClick={openJoinFlat}
        className="h-11 flex-1 gap-2 rounded-md border border-surface-border bg-surface text-sm font-semibold text-ink-strong hover:bg-surface-page"
      >
        <UserPlus className="size-4" aria-hidden strokeWidth={1.75} />
        Join Flat
      </Button>
    </div>
  );
}
