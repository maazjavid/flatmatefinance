"use client";

import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { KickMemberModal } from "@/components/flat/kick-member-modal";
import { PaymentProofUpload } from "@/components/flat/payment-proof-upload";
import type { FlatRole } from "@/lib/types/flat";
import type { FlatBalances, MemberBalanceRow } from "@/lib/types/rent";
import { cn, formatNzd, initials } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useState } from "react";

export type MemberBalancesCardProps = {
  flatId: string;
  balances: FlatBalances;
  currentUserId: string;
  className?: string;
};

function roleLabel(role: FlatRole): string {
  if (role === "owner") return "Owner / Admin";
  if (role === "admin") return "Admin";
  return "Member";
}

function memberStatusLabel(member: MemberBalanceRow): string | null {
  if (member.isRentCollector) return null;
  if (member.owedCents > 0) return `Owes ${formatNzd(member.owedCents)}`;
  return "Paid up";
}

export function MemberBalancesCard({
  flatId,
  balances,
  currentUserId,
  className,
}: MemberBalancesCardProps) {
  const router = useRouter();
  const [kickTarget, setKickTarget] = useState<MemberBalanceRow | null>(null);
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  async function runAction(key: string, url: string, options?: RequestInit) {
    setPendingAction(key);
    setActionError(null);
    try {
      const res = await fetch(url, options);
      const data: { ok?: boolean; error?: string } = await res.json().catch(() => ({}));
      if (!res.ok) {
        setActionError(data.error ?? "Action failed.");
        return;
      }
      router.refresh();
    } catch {
      setActionError("Network error. Please try again.");
    } finally {
      setPendingAction(null);
    }
  }

  return (
    <>
      <Card className={cn("flex flex-col gap-4", className)}>
        <CardHeader>
          <CardTitle>Member Balances</CardTitle>
        </CardHeader>

        {actionError ? (
          <p className="text-sm font-medium text-danger" role="alert" aria-live="polite">
            {actionError}
          </p>
        ) : null}

        <ul className="flex flex-col divide-y divide-surface-line">
          {balances.members.map((member) => {
            const display = member.fullName;
            const ini = initials(display) || display[0]!.toUpperCase();
            const showTag = member.role === "owner" || member.role === "admin";
            const isSelf = member.userId === currentUserId;
            const canRemove =
              balances.isAdmin && !isSelf && member.role !== "owner";
            const owingSplits = member.isRentCollector
              ? []
              : member.splits.filter((split) => split.status === "owing");
            const paidSplits = member.isRentCollector
              ? []
              : member.splits.filter((split) => split.status === "paid");
            const showMemberPaymentActions = isSelf && !member.isRentCollector;

            const statusLabel = memberStatusLabel(member);

            return (
              <li key={member.userId} className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0">
                <div className="flex items-start gap-3">
                  <Avatar
                    initials={ini}
                    highlighted={member.role === "owner"}
                    className="size-10 text-sm"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="truncate text-sm font-medium text-ink-strong">
                        {display}
                        {isSelf ? " (you)" : null}
                      </span>
                      {showTag ? (
                        <Badge variant={member.role === "owner" ? "primary" : "neutral"}>
                          {roleLabel(member.role)}
                        </Badge>
                      ) : null}
                    </div>
                    {statusLabel ? (
                      <p className="mt-1 text-sm text-ink-soft">{statusLabel}</p>
                    ) : null}
                  </div>
                </div>

                {owingSplits.length > 0 ? (
                  <ul className="ml-[52px] flex flex-col gap-2">
                    {owingSplits.map((split) => {
                      const actionKey = `${member.userId}-${split.id}`;
                      const isPending = pendingAction === actionKey;

                      return (
                        <li
                          key={split.id}
                          className="rounded-md border border-surface-line bg-surface-muted px-3 py-3"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div>
                              <p className="text-sm font-medium text-ink-strong">
                                {split.label ?? "Rent share"} · {formatNzd(split.amountCents)}
                              </p>
                              <p className="text-xs text-ink-muted">
                                {split.dueDateLabel ? `Due ${split.dueDateLabel}` : "No due date"}
                                {split.notificationCount > 0
                                  ? ` · Notified ${split.notificationCount}×${
                                      split.lastNotifiedAtLabel
                                        ? ` (last ${split.lastNotifiedAtLabel})`
                                        : ""
                                    }`
                                  : null}
                              </p>
                              {split.hasProof ? (
                                <p className="mt-1 text-xs text-primary-dark">
                                  Proof uploaded
                                  {split.proofFileName ? `: ${split.proofFileName}` : ""}
                                </p>
                              ) : showMemberPaymentActions ? (
                                <p className="mt-1 text-xs text-ink-muted">
                                  Upload proof to enable Mark as Paid
                                </p>
                              ) : null}
                            </div>

                            <div className="flex flex-wrap gap-2">
                              {balances.isAdmin && !isSelf && !member.isRentCollector ? (
                                <>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    disabled={pendingAction !== null}
                                    onClick={() =>
                                      runAction(
                                        actionKey,
                                        `/api/flats/${flatId}/rent/splits/${split.id}/notify`,
                                        { method: "POST" },
                                      )
                                    }
                                    className="h-8 rounded-md border border-surface-border px-3 text-xs"
                                  >
                                    {isPending ? "Sending…" : "Send notification"}
                                  </Button>
                                  <Button
                                    type="button"
                                    disabled={pendingAction !== null}
                                    onClick={() =>
                                      runAction(
                                        actionKey,
                                        `/api/flats/${flatId}/rent/splits/${split.id}/mark-paid`,
                                        { method: "POST" },
                                      )
                                    }
                                    className="h-8 rounded-md px-3 text-xs"
                                  >
                                    {isPending ? "Saving…" : "Mark Paid"}
                                  </Button>
                                </>
                              ) : null}

                              {showMemberPaymentActions ? (
                                <>
                                  <PaymentProofUpload
                                    flatId={flatId}
                                    splitId={split.id}
                                    disabled={pendingAction !== null}
                                    hasProof={split.hasProof}
                                  />
                                  <Button
                                    type="button"
                                    disabled={pendingAction !== null || !split.hasProof}
                                    onClick={() =>
                                      runAction(
                                        actionKey,
                                        `/api/flats/${flatId}/rent/splits/${split.id}/mark-paid`,
                                        { method: "POST" },
                                      )
                                    }
                                    className="h-8 rounded-md px-3 text-xs"
                                  >
                                    {isPending ? "Submitting…" : "Mark as Paid"}
                                  </Button>
                                </>
                              ) : null}
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                ) : null}

                {paidSplits.length > 0 ? (
                  <ul className="ml-[52px] flex flex-col gap-2">
                    {paidSplits.map((split) => (
                      <li
                        key={split.id}
                        className="rounded-md border border-surface-line bg-surface px-3 py-2"
                      >
                        <p className="text-sm text-ink-soft">
                          {split.label ?? "Rent share"} · {formatNzd(split.amountCents)} · Paid
                        </p>
                      </li>
                    ))}
                  </ul>
                ) : null}

                {canRemove ? (
                  <div className="ml-[52px] flex flex-wrap items-center justify-between gap-2 border-t border-surface-line pt-3">
                    <p className="text-xs text-ink-muted">
                      {member.owedCents > 0
                        ? "Remove member from future rent splits (history is kept)."
                        : "Member has paid — you can still remove them from the flat."}
                    </p>
                    <Button
                      type="button"
                      variant="danger"
                      disabled={pendingAction !== null}
                      onClick={() => setKickTarget(member)}
                      className="h-8 shrink-0 rounded-md px-3 text-xs"
                    >
                      Remove member
                    </Button>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      </Card>

      {kickTarget ? (
        <KickMemberModal
          flatId={flatId}
          memberName={kickTarget.fullName}
          memberUserId={kickTarget.userId}
          open={Boolean(kickTarget)}
          onClose={() => setKickTarget(null)}
        />
      ) : null}
    </>
  );
}
