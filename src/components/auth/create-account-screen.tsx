import { BrandHeader } from "@/components/auth/brand-header";
import { CreateAccountForm } from "@/components/auth/create-account-form";
import { cn } from "@/lib/utils";

export type CreateAccountScreenProps = {
  className?: string;
};

export function CreateAccountScreen({ className }: CreateAccountScreenProps) {
  return (
    <div
      className={cn(
        "flex min-h-screen items-center justify-center bg-[#F6F6F8] px-4 py-12",
        className,
      )}
      data-node-id="146:33"
      data-name="Root"
    >
      <div
        className="w-full max-w-[732px] rounded-lg border-[7px] border-[#F6F6F8] bg-[#FEFEFE] px-8 py-12 sm:px-14 sm:py-14"
        data-node-id="146:36"
        data-name="Background"
      >
        <div className="mx-auto flex max-w-[618px] flex-col items-center">
          <BrandHeader className="mb-10" />
          <CreateAccountForm />
        </div>
      </div>
    </div>
  );
}
