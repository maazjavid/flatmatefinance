import { FlatActions } from "@/components/flat/flat-actions";
import { cn } from "@/lib/utils";
import { Home, UserPlus } from "lucide-react";

export type EmptyFlatsStateProps = {
  className?: string;
};

/**
 * "No Flats / Welcome Dashboard" — Figma node 138:2.
 * Server-rendered shell with a small `<FlatActions>` client island for the modals.
 */
export function EmptyFlatsState({ className }: EmptyFlatsStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-screen w-full flex-1 items-center justify-center bg-surface-page px-4 py-12",
        className,
      )}
      data-node-id="138:2"
      data-name="No Flats Dashboard"
    >
      <div className="w-full max-w-[732px] rounded-lg border-[7px] border-surface-page bg-surface px-8 py-12 sm:px-14 sm:py-14">
        <div className="mx-auto flex max-w-[560px] flex-col items-center text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-primary-light text-primary">
            <Home strokeWidth={1.75} className="size-9" aria-hidden />
          </div>

          <h1 className="mt-6 text-[32px] font-bold leading-tight text-ink-strong sm:text-[36px]">
            Welcome to FlatMate Finance
          </h1>
          <p className="mt-3 max-w-[420px] text-lg text-ink-muted">
            You&apos;re not in a flat yet. Create one to invite your flatmates, or join an
            existing flat with an invite code.
          </p>

          <FlatActions className="mt-10 w-full max-w-[440px]" />

          <div className="my-12 h-[3px] w-full max-w-[420px] rounded-full bg-surface-line" />

          <footer className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-base text-ink-muted">
            <UserPlus strokeWidth={1.75} className="size-5 shrink-0 text-primary" aria-hidden />
            <p>
              Already invited?{" "}
              <span className="font-medium text-primary">Use Join Flat above.</span>
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}
