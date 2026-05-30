import type { FlatRole } from "@/lib/types/flat";

export type RentSplitStatus = "owing" | "paid";

export type MemberBalanceRow = {
  userId: string;
  fullName: string;
  role: FlatRole;
  isRentCollector: boolean;
  owedCents: number;
  paidCents: number;
  splits: MemberRentSplit[];
};

export type MemberRentSplit = {
  id: string;
  rentChargeId: string;
  label: string | null;
  dueDateLabel: string | null;
  amountCents: number;
  status: RentSplitStatus;
  notificationCount: number;
  lastNotifiedAtLabel: string | null;
  hasProof: boolean;
  proofFileName: string | null;
};

export type FlatBalances = {
  totalRentCents: number;
  totalOutstandingCents: number;
  activeMemberCount: number;
  nextDueDateLabel: string | null;
  viewerOwedCents: number;
  viewerCollectableCents: number;
  isAdmin: boolean;
  members: MemberBalanceRow[];
};

export type CreateRentInput = {
  amountCents: number;
  dueDate?: string | null;
  label?: string | null;
};

export type CreateRentResponse = {
  ok: true;
  balances: FlatBalances;
};

export type FlatBalancesResponse = {
  balances: FlatBalances;
};

export type RentActionResponse = {
  ok: true;
  balances: FlatBalances;
};
