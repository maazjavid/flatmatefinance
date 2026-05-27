"use client";

import { Avatar } from "@/components/ui/avatar";
import { ChevronDown, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { initials } from "@/lib/utils";

export type UserMenuProps = {
  user: {
    name: string;
    email: string;
  };
};

/**
 * Avatar pill in the topbar — opens a popover with the user's name + email
 * and a Sign out action. Sign-out uses a hard navigation so it survives stale
 * dev-server chunks (no client-side ChunkLoadError on `/sign-in`).
 */
export function UserMenu({ user }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const display = user.name?.trim() || user.email;
  const ini = initials(display) || user.email[0]?.toUpperCase() || "?";

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await signOut({ redirect: false });
    } finally {
      window.location.assign("/sign-in");
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
        className="flex items-center gap-1 rounded-full bg-primary-light/70 py-1 pl-1 pr-2 text-primary-dark transition-colors hover:bg-primary-light focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <Avatar
          initials={ini}
          className="size-7 bg-primary-light text-xs font-semibold text-primary-dark"
        />
        <ChevronDown
          className="size-4"
          strokeWidth={1.75}
          aria-hidden
        />
      </button>

      {open ? (
        <div
          role="menu"
          aria-label="Account"
          className="absolute right-0 top-full z-30 mt-2 w-64 overflow-hidden rounded-lg border border-surface-border bg-surface shadow-[0_24px_60px_-20px_rgba(0,0,0,0.18)]"
        >
          <div className="flex items-center gap-3 border-b border-surface-line px-4 py-3">
            <Avatar
              initials={ini}
              className="size-10 bg-primary-light text-sm font-semibold text-primary-dark"
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-ink-strong">
                {display}
              </p>
              <p className="truncate text-xs text-ink-muted">{user.email}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSignOut}
            disabled={signingOut}
            role="menuitem"
            className="flex w-full items-center gap-2 px-4 py-3 text-sm font-semibold text-danger transition-colors hover:bg-surface-page focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-60"
          >
            <LogOut className="size-4" aria-hidden strokeWidth={1.75} />
            {signingOut ? "Signing out…" : "Sign out"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
