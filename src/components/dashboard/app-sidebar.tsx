import Link from "next/link";
import { Home } from "lucide-react";
import { SidebarActions } from "@/components/dashboard/sidebar-actions";
import {
  SidebarFlatList,
  type SidebarFlatItem,
} from "@/components/dashboard/sidebar-flat-list";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { cn } from "@/lib/utils";

export type AppSidebarProps = {
  flats: SidebarFlatItem[];
  className?: string;
};

/** Persistent left sidebar — Figma nodes 138:2 & 162:2. */
export function AppSidebar({ flats, className }: AppSidebarProps) {
  return (
    <aside
      className={cn(
        "flex w-[230px] shrink-0 flex-col border-r border-surface-border bg-surface px-4 py-5",
        className,
      )}
      aria-label="Sidebar"
    >
      <Link
        href="/flats"
        className="mb-7 flex items-center gap-2 px-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <Home strokeWidth={2} className="size-6 text-primary" aria-hidden />
        <span className="text-base font-bold text-primary">FlatMate Finance</span>
      </Link>

      <div className="flex flex-col gap-2">
        <p className="px-2 text-xs font-medium text-ink-soft">My Flats</p>
        <SidebarFlatList flats={flats} />
      </div>

      <hr className="my-4 border-surface-line" />

      <SidebarActions />

      <div className="mt-auto border-t border-surface-line pt-3">
        <SignOutButton />
      </div>
    </aside>
  );
}
