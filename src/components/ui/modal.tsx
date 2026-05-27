"use client";

import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";

export type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  /** Hide the close (×) button — useful when the modal is a success state with its own dismiss CTA. */
  hideCloseButton?: boolean;
};

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  className,
  hideCloseButton = false,
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onCloseRef.current();
      }
    }
    document.addEventListener("keydown", handleKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = previousOverflow;
    };
    // Only re-run when open toggles — not when `onClose` identity changes.
  }, [open]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink-strong/40 px-4 py-8"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        tabIndex={-1}
        className={cn(
          "w-full max-w-md rounded-lg bg-surface p-6 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.25)] outline-none",
          className,
        )}
      >
        <header className="mb-5 flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h2 id="modal-title" className="text-xl font-bold text-ink-strong">
              {title}
            </h2>
            {description ? (
              <p className="text-sm text-ink-muted">{description}</p>
            ) : null}
          </div>
          {hideCloseButton ? null : (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="rounded-full p-1 text-ink-muted transition-colors hover:bg-surface-line hover:text-ink-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <X className="size-5" aria-hidden strokeWidth={1.75} />
            </button>
          )}
        </header>
        {children}
      </div>
    </div>
  );
}
