"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

export type PaymentProofUploadProps = {
  flatId: string;
  splitId: string;
  disabled?: boolean;
  hasProof?: boolean;
};

export function PaymentProofUpload({
  flatId,
  splitId,
  disabled = false,
  hasProof = false,
}: PaymentProofUploadProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.set("file", file);

      const res = await fetch(`/api/flats/${flatId}/rent/splits/${splitId}/proof`, {
        method: "POST",
        body: formData,
      });
      const data: { ok?: boolean; error?: string } = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error ?? "Upload failed.");
        return;
      }

      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setUploading(false);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <input
        ref={inputRef}
        type="file"
        accept="image/*,.pdf"
        className="hidden"
        onChange={handleFileChange}
      />
      <Button
        type="button"
        variant="ghost"
        disabled={disabled || uploading}
        onClick={() => inputRef.current?.click()}
        className="h-8 rounded-md border border-surface-border px-3 text-xs"
      >
        {uploading ? "Uploading…" : hasProof ? "Replace proof" : "Upload proof"}
      </Button>
      {error ? (
        <span className="text-xs text-danger" role="alert">
          {error}
        </span>
      ) : null}
    </div>
  );
}
