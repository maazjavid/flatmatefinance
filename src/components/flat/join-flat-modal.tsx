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

/** Figma: node 201:2. Collects an invite code and (mocked) joins the matching flat. */
export function JoinFlatModal({ open, onClose }: JoinFlatModalProps) {
  const router = useRouter();
  const [inviteCode, setInviteCode] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function resetAndClose() {
    setInviteCode("");
    setSubmitting(false);
    onClose();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!inviteCode.trim()) {
      return;
    }
    setSubmitting(true);

    // TODO: Phase 2 — call `POST /api/flats/join` with { inviteCode } and use the returned flatId
    const fakeId = "flat-demo";
    setSubmitting(false);
    resetAndClose();
    router.push(`/flats/${fakeId}`);
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
            placeholder="SUN-4F2K9"
            value={inviteCode}
            onChange={(event) => setInviteCode(event.target.value.toUpperCase())}
            required
            autoFocus
            autoCapitalize="characters"
            spellCheck={false}
            className="font-mono tracking-[0.18em]"
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row-reverse">
          <Button
            type="submit"
            disabled={submitting || !inviteCode.trim()}
            className="h-12 flex-1 rounded-[6px] border-primary text-base font-semibold"
          >
            Join Flat
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={resetAndClose}
            className="h-12 flex-1 rounded-[6px] border border-surface-border text-base font-medium text-ink-soft"
          >
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
}
