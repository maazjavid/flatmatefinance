import { cn } from "@/lib/utils";

type AvatarProps = {
  initials: string;
  highlighted?: boolean;
  className?: string;
};

export function Avatar({ initials, highlighted = false, className }: AvatarProps) {
  return (
    <div
      className={cn(
        "flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-medium",
        highlighted
          ? "bg-primary text-white"
          : "bg-surface-line text-ink-soft",
        className,
      )}
    >
      {initials}
    </div>
  );
}
