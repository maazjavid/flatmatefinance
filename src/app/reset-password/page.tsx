import { ResetPasswordScreen } from "@/components/auth/reset-password-screen";

type ResetPasswordPageProps = {
  searchParams?: Promise<{ token?: string }>;
};

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const params = (await searchParams) ?? {};
  const token = typeof params.token === "string" && params.token.length > 0 ? params.token : null;

  return <ResetPasswordScreen token={token} />;
}
