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
      <div className={cn("flex w-full flex-col gap-3 sm:flex-row sm:justify-center", className)}>
        <Button
          type="button"
          onClick={() => setOpenModal("create")}
          className="h-[58px] flex-1 gap-2 rounded-[6px] border-primary text-lg font-semibold"
        >
          <Plus className="size-5" aria-hidden strokeWidth={1.75} />
          Create Flat
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => setOpenModal("join")}
          className="h-[58px] flex-1 gap-2 rounded-[6px] border border-primary-light bg-surface text-lg font-semibold text-primary hover:bg-primary-light/40"
        >
          <UserPlus className="size-5" aria-hidden strokeWidth={1.75} />
          Join Flat
        </Button>
      </div>

      <CreateFlatModal open={openModal === "create"} onClose={() => setOpenModal(null)} />
      <JoinFlatModal open={openModal === "join"} onClose={() => setOpenModal(null)} />
    </>
  );
}
