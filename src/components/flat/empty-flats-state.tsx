import { FlatActions } from "@/components/flat/flat-actions";
import { Home } from "lucide-react";

/** "No Flats / Welcome" main-area card — Figma node 138:2. */
export function EmptyFlatsState() {
  return (
    <div
      className="flex min-h-[480px] items-center justify-center py-6"
      data-node-id="138:2"
      data-name="No Flats Dashboard"
    >
      <div className="w-full max-w-2xl rounded-lg border border-surface-border bg-surface px-8 py-14 text-center">
        <div className="mx-auto flex max-w-md flex-col items-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-primary-light text-primary">
            <Home strokeWidth={1.75} className="size-7" aria-hidden />
          </div>

          <h1 className="mt-5 text-2xl font-bold leading-tight text-ink-strong">
            You don&apos;t have any flats yet.
          </h1>
          <p className="mt-2 text-sm text-ink-muted">
            Create a new flat or join an existing one to start managing your shared
            expenses.
          </p>

          <FlatActions className="mt-7 w-full max-w-sm" />
        </div>
      </div>
    </div>
  );
}
