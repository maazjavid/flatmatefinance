import Link from "next/link";
import { BrandHeader } from "@/components/auth/brand-header";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { cn } from "@/lib/utils";

export type ResetPasswordScreenProps = {
  className?: string;
  token: string | null;
};

export function ResetPasswordScreen({ className, token }: ResetPasswordScreenProps) {
  return (
    <div
      className={cn(
        "flex min-h-screen items-center justify-center bg-surface-page px-4 py-12",
        className,
      )}
    >
      <div className="w-full max-w-[732px] rounded-lg border-[7px] border-surface-page bg-surface px-8 py-12 sm:px-14 sm:py-14">
        <div className="mx-auto flex max-w-[618px] flex-col items-center">
          <BrandHeader className="mb-10" />
          {token ? (
            <ResetPasswordForm token={token} />
          ) : (
            <div className="flex w-full flex-col items-center gap-4 text-center">
              <h2 className="text-[35px] font-bold leading-tight text-ink-strong">
                Reset link required
              </h2>
              <p className="text-xl text-ink-subtitle">
                Open the link from your reset email to set a new password.
              </p>
              <Link
                href="/forgot-password"
                className="mt-4 font-semibold text-primary"
              >
                Request a new reset email
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
