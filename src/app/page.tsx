import { cn } from "@/lib/utils";
import { Home, UserPlus } from "lucide-react";
import Link from "next/link";

/** Landing / auth entry — built from Figma "Home Screen" (node 50:2). */
export default function HomePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F7F7F9] px-4 py-12">
      <div
        className="w-full max-w-[836px] rounded-lg bg-[#FEFEFE] px-10 py-14 shadow-[0_4px_100px_-4px_rgba(0,0,0,0.1)] sm:px-16 sm:py-16"
        data-node-id="50:2"
        data-name="Home Screen"
      >
        <div className="mx-auto flex max-w-xl flex-col items-center">
          <header className="flex flex-col items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="flex size-[54px] items-center justify-center text-primary">
                <Home strokeWidth={1.75} className="size-[42px]" aria-hidden />
              </div>
              <h1 className="text-[32px] font-bold leading-none text-primary sm:text-[40px]">
                FlatMate Finance
              </h1>
            </div>
            <Divider />
          </header>

          <p className="mt-10 max-w-[340px] text-center text-xl leading-[1.45] text-[#7A8291] sm:max-w-[360px] sm:text-2xl sm:leading-[1.42]">
            Create a flat, share the invite, and manage your members.
          </p>

          <div className="mt-12 flex w-full max-w-[640px] flex-col gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/sign-in"
              className={cn(
                "inline-flex flex-1 items-center justify-center rounded-[6px] border border-primary",
                "bg-[#03925F] px-6 py-[18px] text-[22px] font-normal leading-none text-white",
                "transition-colors hover:bg-primary-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
              )}
            >
              Sign In
            </Link>
            <Link
              href="/create-account"
              className={cn(
                "inline-flex flex-1 items-center justify-center rounded-[6px]",
                "border border-primary-light bg-[#FEFEFE] px-6 py-[18px]",
                "text-[21px] font-semibold leading-none text-primary",
                "transition-colors hover:bg-primary-light/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
              )}
            >
              Create Account
            </Link>
          </div>

          <DividerWide className="my-14" />

          <footer className="flex max-w-xl flex-wrap items-center justify-center gap-x-2 gap-y-1 text-center text-xl text-[#7F8797]">
            <UserPlus
              strokeWidth={1.75}
              className="size-6 shrink-0 text-primary"
              aria-hidden
            />
            <p>
              Already invited?{" "}
              <span className="font-medium text-primary">Join a flat after signing in.</span>
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}

function Divider() {
  return <div className="h-[3px] w-12 shrink-0 rounded-full bg-[#EAEBEF]" />;
}

function DividerWide({ className }: { className?: string }) {
  return <div className={cn("h-[3px] w-full max-w-[610px] rounded-full bg-[#EAEBEF]", className)} />;
}
