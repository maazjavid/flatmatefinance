"use client";

import { Plus, UserPlus } from "lucide-react";
import { useFlatModals } from "@/components/flat/flat-modals-provider";
import { cn } from "@/lib/utils";

export type SidebarActionsProps = {
  className?: string;
};

/** Sidebar Create / Join buttons — modals live in `FlatModalsProvider`. */
export function SidebarActions({ className }: SidebarActionsProps) {
  const { openCreateFlat, openJoinFlat } = useFlatModals();

  return (
    <div className={cn("flex flex-col gap-0.5", className)}>
      <SidebarActionButton
        icon={<Plus className="size-4" aria-hidden strokeWidth={1.75} />}
        label="Create Flat"
        onClick={openCreateFlat}
        emphasis
      />
      <SidebarActionButton
        icon={<UserPlus className="size-4" aria-hidden strokeWidth={1.75} />}
        label="Join Flat"
        onClick={openJoinFlat}
      />
    </div>
  );
}

function SidebarActionButton({
  icon,
  label,
  onClick,
  emphasis = false,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  emphasis?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
        emphasis
          ? "font-semibold text-ink-strong hover:bg-surface-page"
          : "font-medium text-ink-soft hover:bg-surface-page hover:text-ink-strong",
      )}
    >
      {icon}
      {label}
    </button>
  );
}
