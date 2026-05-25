"use client";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";
import { useState, type InputHTMLAttributes } from "react";

export type PasswordInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type">;

export function PasswordInput({ className, id, ...props }: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

//created a password input component that is used in the app

  return (
    <div className="relative">
      <Input
        id={id}
        type={showPassword ? "text" : "password"}
        className={cn("pr-14", className)}
        {...props}
      />
      <button
        type="button"
        className="absolute right-5 top-1/2 -translate-y-1/2 text-[#696D76]"
        aria-label={showPassword ? "Hide password" : "Show password"}
        onClick={() => {
          setShowPassword((visible) => !visible);
        }}
      >
        {showPassword ? (
          <EyeOff strokeWidth={1.75} className="size-[22px]" aria-hidden />
        ) : (
          <Eye strokeWidth={1.75} className="size-[22px]" aria-hidden />
        )}
      </button>
    </div>
  );
}
