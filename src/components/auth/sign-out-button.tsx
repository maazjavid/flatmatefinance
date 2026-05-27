"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export type SignOutButtonProps = {
  className?: string;
};

export function SignOutButton({ className }: SignOutButtonProps) {
  const [pending, setPending] = useState(false);

  async function handleClick() {
    setPending(true);
    try {
      // `redirect: false` keeps NextAuth from doing a client-side router push
      // that can hit a stale dev chunk; we do a full-page navigation instead.
      await signOut({ redirect: false });
    } finally {
      window.location.assign("/sign-in");
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      className={cn(
        "flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm font-semibold text-danger transition-colors",
        "hover:bg-surface-page focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
        "disabled:opacity-60",
        className,
      )}
    >
      <LogOut className="size-4" aria-hidden strokeWidth={1.75} />
      {pending ? "Signing out…" : "Sign out"}
    </button>
  );
}
