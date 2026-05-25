import { cn } from "@/lib/utils";
import { type LabelHTMLAttributes } from "react";

export type LabelProps = LabelHTMLAttributes<HTMLLabelElement>;


//created a label component that is used in the app

export function Label({ className, ...props }: LabelProps) {
  return (
    <label
      className={cn("text-lg font-semibold text-[#6D7079]", className)}
      {...props}
    />
  );
}
