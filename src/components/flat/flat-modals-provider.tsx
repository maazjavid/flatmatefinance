"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { CreateFlatModal } from "@/components/flat/create-flat-modal";
import { JoinFlatModal } from "@/components/flat/join-flat-modal";

type ModalKey = "create" | "join" | null;

type FlatModalsContextValue = {
  openCreateFlat: () => void;
  openJoinFlat: () => void;
};

const FlatModalsContext = createContext<FlatModalsContextValue | null>(null);

/**
 * Single mount point for Create / Join modals across the dashboard.
 * Avoids duplicate modal instances (sidebar + empty state) and keeps input
 * state stable while typing.
 */
export function FlatModalsProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState<ModalKey>(null);

  const close = useCallback(() => setOpen(null), []);
  const openCreateFlat = useCallback(() => setOpen("create"), []);
  const openJoinFlat = useCallback(() => setOpen("join"), []);

  const value = useMemo(
    () => ({ openCreateFlat, openJoinFlat }),
    [openCreateFlat, openJoinFlat],
  );

  return (
    <FlatModalsContext.Provider value={value}>
      {children}
      <CreateFlatModal open={open === "create"} onClose={close} />
      <JoinFlatModal open={open === "join"} onClose={close} />
    </FlatModalsContext.Provider>
  );
}

export function useFlatModals() {
  const ctx = useContext(FlatModalsContext);
  if (!ctx) {
    throw new Error("useFlatModals must be used within FlatModalsProvider");
  }
  return ctx;
}
