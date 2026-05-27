import { Bell } from "lucide-react";
import { UserMenu } from "@/components/dashboard/user-menu";
import { cn } from "@/lib/utils";

export type TopbarProps = {
  user: {
    name: string;
    email: string;
  };
  className?: string;
};

/**
 * Right-aligned dashboard top bar — notifications bell + UserMenu popover.
 * The page itself renders any page-specific title / actions below this bar.
 */
export function Topbar({ user, className }: TopbarProps) {
  return (
    <header
      className={cn(
        "flex h-14 items-center justify-end gap-2 bg-surface-muted px-6",
        className,
      )}
    >
      <button
        type="button"
        aria-label="Notifications"
        className="rounded-full p-2 text-ink-soft transition-colors hover:bg-surface-page focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <Bell className="size-5" aria-hidden strokeWidth={1.75} />
      </button>

      <UserMenu user={user} />
    </header>
  );
}
