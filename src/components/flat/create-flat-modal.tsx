"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

export type CreateFlatModalProps = {
  open: boolean;
  onClose: () => void;
};

/**
 * Single-phase modal that POSTs to `/api/flats` and routes to the new flat's
 * "Flat Created" page (Figma node 162:2) — `/flats/[id]?created=1`.
 */
export function CreateFlatModal({ open, onClose }: CreateFlatModalProps) {
  const router = useRouter();
  const [flatName, setFlatName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function resetAndClose() {
    setFlatName("");
    setSubmitting(false);
    setError(null);
    onClose();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = flatName.trim();
    if (!name) return;

    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/flats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data: {
        flat?: { id: string; name: string; inviteCode: string };
        error?: string;
      } = await res.json().catch(() => ({}));

      if (!res.ok || !data.flat) {
        setError(data.error ?? "Could not create flat. Please try again.");
        return;
      }

      const flatId = data.flat.id;
      resetAndClose();
      router.push(`/flats/${flatId}?created=1`);
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
      title="Create Flat"
      description="Give your flat a name. You can invite flatmates next."
    >
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-5"
        data-node-id="143:49"
        data-name="Create Flat Modal"
      >
        <div className="flex flex-col gap-2">
          <Label htmlFor="flat-name">Flat name</Label>
          <Input
            id="flat-name"
            name="flatName"
            type="text"
            placeholder="Kea House"
            value={flatName}
            onChange={(event) => setFlatName(event.target.value)}
            required
            autoFocus
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
            disabled={submitting || !flatName.trim()}
            className="h-11 flex-1 rounded-md border-primary text-sm font-semibold"
          >
            {submitting ? "Creating…" : "Create Flat"}
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
