import { BrandHeader } from "@/components/auth/brand-header";
import { CreateAccountForm } from "@/components/auth/create-account-form";
import { cn } from "@/lib/utils";

export type CreateAccountScreenProps = {
  className?: string;
  callbackUrl: string;
  isInviteJoin?: boolean;
};

export function CreateAccountScreen({
  className,
  callbackUrl,
  isInviteJoin = false,
}: CreateAccountScreenProps) {
  return (
    <div
      className={cn(
        "flex min-h-screen items-center justify-center bg-surface-page px-4 py-12",
        className,
      )}
      data-node-id="146:33"
      data-name="Root"
    >
      <div
        className="w-full max-w-[732px] rounded-lg border-[7px] border-surface-page bg-surface px-8 py-12 sm:px-14 sm:py-14"
        data-node-id="146:36"
        data-name="Background"
      >
        <div className="mx-auto flex max-w-[618px] flex-col items-center">
          <BrandHeader
            tagline={
              isInviteJoin
                ? "Create your account to join your flatmates."
                : undefined
            }
            className="mb-10"
          />
          {isInviteJoin ? (
            <p className="mb-6 max-w-md text-center text-sm text-ink-soft">
              You were invited to join a flat. Create a free account below — after
              sign-up you&apos;ll be added to the flat automatically. Already have an
              account?{" "}
              <a
                href={`/sign-in?next=${encodeURIComponent(callbackUrl)}`}
                className="font-medium text-primary hover:text-primary-dark"
              >
                Sign in instead
              </a>
              .
            </p>
          ) : null}
          <CreateAccountForm callbackUrl={callbackUrl} />
        </div>
      </div>
    </div>
  );
}
