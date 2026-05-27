"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home } from "lucide-react";
import { cn } from "@/lib/utils";

export type SidebarFlatItem = {
  id: string;
  name: string;
};

export type SidebarFlatListProps = {
  flats: SidebarFlatItem[];
};

export function SidebarFlatList({ flats }: SidebarFlatListProps) {
  const pathname = usePathname() ?? "";

  if (flats.length === 0) {
    return (
      <div className="rounded-md bg-surface-page px-4 py-5 text-center">
        <Home
          className="mx-auto size-5 text-ink-muted"
          aria-hidden
          strokeWidth={1.75}
        />
        <p className="mt-2 text-sm font-semibold text-ink-strong">No flats yet</p>
        <p className="mt-1 text-xs text-ink-muted">
          Create or join a flat to get started.
        </p>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-0.5">
      {flats.map((flat) => {
        const href = `/flats/${flat.id}`;
        const active = pathname === href || pathname.startsWith(`${href}/`);

        return (
          <li key={flat.id}>
            <Link
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors",
                "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
                active
                  ? "bg-primary-light font-semibold text-primary-dark"
                  : "font-medium text-ink-soft hover:bg-surface-page hover:text-ink-strong",
              )}
            >
              <Home className="size-4" aria-hidden strokeWidth={1.75} />
              <span className="truncate">{flat.name}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
