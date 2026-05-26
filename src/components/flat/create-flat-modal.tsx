"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import { ShareInviteCard } from "@/components/flat/share-invite-card";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

export type CreateFlatModalProps = {
  open: boolean;
  onClose: () => void;
};

type CreatedFlat = {
  id: string;
  name: string;
  inviteCode: string;
};

/**
 * Two-phase modal:
 * 1. "form"    — collect flat name.
 * 2. "created" — show invite code, copy / share actions, and a "Go to Flat" CTA.
 *
 * Figma: nodes 143:49 (form) and 162:2 (success).
 */
export function CreateFlatModal({ open, onClose }: CreateFlatModalProps) {
  const router = useRouter();
  const [flatName, setFlatName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [createdFlat, setCreatedFlat] = useState<CreatedFlat | null>(null);

  function resetAndClose() {
    setFlatName("");
    setCreatedFlat(null);
    setSubmitting(false);
    onClose();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!flatName.trim()) {
      return;
    }
    setSubmitting(true);

    // TODO: Phase 2 — call `POST /api/flats` with { name } and use the returned flat
    const fakeId = "flat-demo";
    const fakeInviteCode = "SUN-4F2K9";
    setCreatedFlat({ id: fakeId, name: flatName.trim(), inviteCode: fakeInviteCode });
    setSubmitting(false);
  }

  function handleGoToFlat() {
    if (!createdFlat) {
      return;
    }
    const flatId = createdFlat.id;
    resetAndClose();
    router.push(`/flats/${flatId}`);
  }

  if (createdFlat) {
    return (
      <Modal
        open={open}
        onClose={resetAndClose}
        title="Flat Created"
        description={`${createdFlat.name} is ready. Share the invite code below.`}
        hideCloseButton
      >
        <div className="flex flex-col gap-5" data-node-id="162:2" data-name="Flat Created">
          <ShareInviteCard
            flatName={createdFlat.name}
            inviteCode={createdFlat.inviteCode}
            helper="Send this code to a flatmate so they can join your flat."
          />
          <Button
            type="button"
            onClick={handleGoToFlat}
            className="h-12 w-full rounded-[6px] border-primary text-base font-semibold"
          >
            Go to Flat
          </Button>
        </div>
      </Modal>
    );
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
        className="flex flex-col gap-6"
        data-node-id="143:49"
        data-name="Create Flat Modal"
      >
        <div className="flex flex-col gap-2">
          <Label htmlFor="flat-name">Flat name</Label>
          <Input
            id="flat-name"
            name="flatName"
            type="text"
            placeholder="Sunny Apartments"
            value={flatName}
            onChange={(event) => setFlatName(event.target.value)}
            required
            autoFocus
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row-reverse">
          <Button
            type="submit"
            disabled={submitting || !flatName.trim()}
            className="h-12 flex-1 rounded-[6px] border-primary text-base font-semibold"
          >
            Create Flat
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
