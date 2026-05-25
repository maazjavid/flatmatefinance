import { cn } from "@/lib/utils";
import { Home } from "lucide-react";

export type BrandHeaderProps = {
  tagline?: string;
  className?: string;
};

export function BrandHeader({
  tagline = "Manage flat expenses, together.",
  className,
}: BrandHeaderProps) {
  return (
    <header className={cn("flex flex-col items-center gap-2 text-center", className)}>
      <div className="flex items-center gap-3">
        <div className="flex size-[50px] items-center justify-center text-primary">
          <Home strokeWidth={1.75} className="size-10" aria-hidden />
        </div>
        <h1 className="text-[41px] font-bold leading-none text-primary">FlatMate Finance</h1>
      </div>
      <p className="text-[22px] font-medium text-[#808694]">{tagline}</p>
    </header>
  );
}
