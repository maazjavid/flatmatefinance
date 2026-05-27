"use client";

import { Button } from "@/components/ui/button";
import { CreateFlatModal } from "@/components/flat/create-flat-modal";
import { JoinFlatModal } from "@/components/flat/join-flat-modal";
import { cn } from "@/lib/utils";
import { Plus, UserPlus } from "lucide-react";
import { useState } from "react";

type ModalKey = "create" | "join" | null;

export type FlatActionsProps = {
  className?: string;
};

/** Small client island that owns the modal open/close state for Create + Join flows. */
export function FlatActions({ className }: FlatActionsProps) {
  const [openModal, setOpenModal] = useState<ModalKey>(null);

  return (
    <>
      <div className={cn("flex w-full flex-col gap-2.5 sm:flex-row sm:justify-center", className)}>
        <Button
          type="button"
          onClick={() => setOpenModal("create")}
          className="h-11 flex-1 gap-2 rounded-md border-primary text-sm font-semibold"
        >
          <Plus className="size-4" aria-hidden strokeWidth={1.75} />
          Create Flat
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => setOpenModal("join")}
          className="h-11 flex-1 gap-2 rounded-md border border-surface-border bg-surface text-sm font-semibold text-ink-strong hover:bg-surface-page"
        >
          <UserPlus className="size-4" aria-hidden strokeWidth={1.75} />
          Join Flat
        </Button>
      </div>

      <CreateFlatModal open={openModal === "create"} onClose={() => setOpenModal(null)} />
      <JoinFlatModal open={openModal === "join"} onClose={() => setOpenModal(null)} />
    </>
  );
}
