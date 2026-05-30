"use client";

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn, formatNzd } from "@/lib/utils";
import type { FlatBalances } from "@/lib/types/rent";
import { useState } from "react";
import { AddRentModal } from "@/components/flat/add-rent-modal";

export type RentBalancesCardProps = {
  flatId: string;
  balances: FlatBalances;
  className?: string;
};

export function RentBalancesCard({ flatId, balances, className }: RentBalancesCardProps) {
  const [addRentOpen, setAddRentOpen] = useState(false);

  return (
    <>
      <Card className={cn("flex flex-col gap-4", className)}>
        <CardHeader className="mb-0 flex-row items-start justify-between gap-3">
          <div className="flex flex-col gap-0.5">
            <CardTitle>Rent &amp; Balances</CardTitle>
            <CardDescription>
              {balances.activeMemberCount}{" "}
              {balances.activeMemberCount === 1 ? "active member" : "active members"}
              {balances.nextDueDateLabel ? ` · Next due ${balances.nextDueDateLabel}` : null}
            </CardDescription>
          </div>
          {balances.isAdmin ? (
            <Button
              type="button"
              onClick={() => setAddRentOpen(true)}
              className="h-9 shrink-0 rounded-md px-3 text-xs"
            >
              Add Rent
            </Button>
          ) : null}
        </CardHeader>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <BalanceStat label="Total rent added" value={formatNzd(balances.totalRentCents)} />
          <BalanceStat
            label="Total outstanding"
            value={formatNzd(balances.totalOutstandingCents)}
          />
          <BalanceStat
            label={balances.isAdmin ? "Others owe you" : "You owe"}
            value={formatNzd(
              balances.isAdmin ? balances.viewerCollectableCents : balances.viewerOwedCents,
            )}
            highlight={
              balances.isAdmin
                ? balances.viewerCollectableCents > 0
                : balances.viewerOwedCents > 0
            }
          />
        </div>
      </Card>

      <AddRentModal flatId={flatId} open={addRentOpen} onClose={() => setAddRentOpen(false)} />
    </>
  );
}

function BalanceStat({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-md border border-surface-line bg-surface-muted px-4 py-3">
      <p className="text-xs text-ink-muted">{label}</p>
      <p
        className={cn(
          "mt-1 text-lg font-semibold",
          highlight ? "text-primary-dark" : "text-ink-strong",
        )}
      >
        {value}
      </p>
    </div>
  );
}
