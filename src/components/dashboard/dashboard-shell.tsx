import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { Topbar } from "@/components/dashboard/topbar";
import { FlatModalsProvider } from "@/components/flat/flat-modals-provider";
import type { SidebarFlatItem } from "@/components/dashboard/sidebar-flat-list";
import type { ReactNode } from "react";

export type DashboardShellProps = {
  user: { name: string; email: string };
  flats: SidebarFlatItem[];
  children: ReactNode;
};

/**
 * Page-level layout used by every authenticated `/flats` route.
 * Owns the persistent sidebar + topbar so individual pages only render their
 * own header + body sections.
 */
export function DashboardShell({ user, flats, children }: DashboardShellProps) {
  return (
    <FlatModalsProvider>
      <div className="flex min-h-screen w-full flex-1 bg-surface-muted">
        <AppSidebar flats={flats} />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar user={user} />
          <main className="flex-1 overflow-y-auto px-6 pb-8 pt-2">
            <div className="mx-auto w-full max-w-4xl">{children}</div>
          </main>
        </div>
      </div>
    </FlatModalsProvider>
  );
}
