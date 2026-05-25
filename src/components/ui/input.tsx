import { cn } from "@/lib/utils";
import { forwardRef, type InputHTMLAttributes } from "react";

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

//created an input component that is used in the app

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, type = "text", ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      type={type}
      className={cn(
        "h-16 w-full rounded-[6px] border border-[#DCDEE4] bg-[#FEFEFE] px-5 text-xl text-ink outline-none",
        "placeholder:text-[#B8BBC5] focus-visible:border-2 focus-visible:border-[#DBDEE4]",
        className,
      )}
      {...props}
    />
  );
});
