import { cn } from "@/lib/utils";
import { type ButtonHTMLAttributes, forwardRef } from "react";

type ButtonVariant = "primary" | "ghost" | "danger";

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-primary text-white hover:bg-primary-dark border border-primary-dark",
  ghost: "bg-transparent text-ink hover:bg-surface-border border border-transparent",
  danger: "bg-transparent text-danger hover:bg-red-50 border border-transparent",
};

//created a button component that is used in the app
export const Button = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }
>(function Button({ className, variant = "primary", ...props }, ref) {
  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-50",
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  );
});
