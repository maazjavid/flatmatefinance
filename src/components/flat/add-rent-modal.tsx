"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

export type AddRentModalProps = {
  flatId: string;
  open: boolean;
  onClose: () => void;
};

export function AddRentModal({ flatId, open, onClose }: AddRentModalProps) {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [label, setLabel] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function resetAndClose() {
    setAmount("");
    setDueDate("");
    setLabel("");
    setSubmitting(false);
    setError(null);
    onClose();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const amountDollars = Number.parseFloat(amount);
    if (!Number.isFinite(amountDollars) || amountDollars <= 0) {
      setError("Enter a valid rent amount.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/flats/${flatId}/rent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amountDollars,
          dueDate: dueDate || null,
          label: label.trim() || null,
        }),
      });
      const data: { ok?: boolean; error?: string } = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error ?? "Could not add rent. Please try again.");
        return;
      }

      resetAndClose();
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={resetAndClose}
      title="Add Rent"
      description="Enter the full rent amount. It is split equally across all members — flatmates are charged their share; admins are not."
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <Label htmlFor="rent-amount">Amount (NZD)</Label>
          <Input
            id="rent-amount"
            name="amount"
            type="number"
            min="0.01"
            step="0.01"
            placeholder="2400.00"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            required
            autoFocus
            className="h-12 text-base"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="rent-due-date">Due date (optional)</Label>
          <Input
            id="rent-due-date"
            name="dueDate"
            type="date"
            value={dueDate}
            onChange={(event) => setDueDate(event.target.value)}
            className="h-12 text-base"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="rent-label">Note (optional)</Label>
          <Input
            id="rent-label"
            name="label"
            type="text"
            placeholder="March rent"
            value={label}
            onChange={(event) => setLabel(event.target.value)}
            className="h-12 text-base"
          />
        </div>

        {error ? (
          <p className="text-sm font-medium text-danger" role="alert" aria-live="polite">
            {error}
          </p>
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row-reverse">
          <Button
            type="submit"
            disabled={submitting || !amount.trim()}
            className="h-11 flex-1 rounded-md"
          >
            {submitting ? "Adding…" : "Add Rent"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={resetAndClose}
            disabled={submitting}
            className="h-11 flex-1 rounded-md border border-surface-border text-sm font-medium text-ink-soft"
          >
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
}
