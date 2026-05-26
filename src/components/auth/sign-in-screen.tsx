import { BrandHeader } from "@/components/auth/brand-header";
import { SignInForm } from "@/components/auth/sign-in-form";
import { cn } from "@/lib/utils";

export type SignInScreenProps = {
  className?: string;
  callbackUrl: string;
};

export function SignInScreen({ className, callbackUrl }: SignInScreenProps) {
  return (
    <div
      className={cn(
        "flex min-h-screen items-center justify-center bg-surface-page px-4 py-12",
        className,
      )}
      data-node-id="146:5"
      data-name="Root"
    >
      <div
        className="w-full max-w-[732px] rounded-lg border-[7px] border-surface-page bg-surface px-8 py-12 sm:px-14 sm:py-14"
        data-node-id="146:8"
        data-name="Background"
      >
        <div className="mx-auto flex max-w-[618px] flex-col items-center">
          <BrandHeader className="mb-10" />
          <SignInForm callbackUrl={callbackUrl} />
        </div>
      </div>
    </div>
  );
}
