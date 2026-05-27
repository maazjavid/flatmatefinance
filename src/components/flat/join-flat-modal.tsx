"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

export type JoinFlatModalProps = {
  open: boolean;
  onClose: () => void;
};

/** Figma: node 201:2. Collects an invite code and joins the matching flat. */
export function JoinFlatModal({ open, onClose }: JoinFlatModalProps) {
  const router = useRouter();
  const [inviteCode, setInviteCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function resetAndClose() {
    setInviteCode("");
    setSubmitting(false);
    setError(null);
    onClose();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const code = inviteCode.trim().toUpperCase();
    if (!code) return;

    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/flats/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteCode: code }),
      });
      const data: { flat?: { id: string }; error?: string } = await res.json().catch(() => ({}));

      if (!res.ok || !data.flat) {
        setError(data.error ?? "Could not join flat. Please try again.");
        return;
      }

      const flatId = data.flat.id;
      resetAndClose();
      router.push(`/flats/${flatId}`);
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
      title="Join Flat"
      description="Enter the invite code shared by your flatmate."
    >
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-6"
        data-node-id="201:2"
        data-name="Join Flat Modal"
      >
        <div className="flex flex-col gap-2">
          <Label htmlFor="invite-code">Invite code</Label>
          <Input
            id="invite-code"
            name="inviteCode"
            type="text"
            placeholder="NZFLATO1"
            value={inviteCode}
            onChange={(event) => setInviteCode(event.target.value.toUpperCase())}
            required
            autoFocus
            autoCapitalize="characters"
            spellCheck={false}
            maxLength={12}
            className="font-mono tracking-[0.12em]"
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
            disabled={submitting || !inviteCode.trim()}
            className="h-11 flex-1 rounded-[6px] border-primary text-sm font-semibold"
          >
            {submitting ? "Joining…" : "Join Flat"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={resetAndClose}
            disabled={submitting}
            className="h-11 flex-1 rounded-[6px] border border-surface-border text-sm font-medium text-ink-soft"
          >
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
}
