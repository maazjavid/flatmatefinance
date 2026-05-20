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
        "flex size-11 shrink-0 items-center justify-center rounded-full text-sm font-medium",
        highlighted ? "bg-primary text-white" : "bg-[#EAEBF0] text-[#6A7076]",
        className,
      )}
    >
      {initials}
    </div>
  );
}

