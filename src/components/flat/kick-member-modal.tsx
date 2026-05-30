"use client";

import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { useRouter } from "next/navigation";
import { useState } from "react";

export type KickMemberModalProps = {
  flatId: string;
  memberName: string;
  memberUserId: string;
  open: boolean;
  onClose: () => void;
};

export function KickMemberModal({
  flatId,
  memberName,
  memberUserId,
  open,
  onClose,
}: KickMemberModalProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/flats/${flatId}/members/${memberUserId}/remove`, {
        method: "POST",
      });
      const data: { ok?: boolean; error?: string } = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error ?? "Could not remove member.");
        return;
      }

      onClose();
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
      onClose={onClose}
      title="Remove member"
      description={`Remove ${memberName} from this flat? Their history stays intact, but they won't be included in future rent splits.`}
    >
      {error ? (
        <p className="mb-4 text-sm font-medium text-danger" role="alert" aria-live="polite">
          {error}
        </p>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row-reverse">
        <Button
          type="button"
          variant="danger"
          disabled={submitting}
          onClick={handleConfirm}
          className="h-11 flex-1 rounded-md border border-danger"
        >
          {submitting ? "Removing…" : "Remove member"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          disabled={submitting}
          onClick={onClose}
          className="h-11 flex-1 rounded-md border border-surface-border text-sm font-medium text-ink-soft"
        >
          Cancel
        </Button>
      </div>
    </Modal>
  );
}
