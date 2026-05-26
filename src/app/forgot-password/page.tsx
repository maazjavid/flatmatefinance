import { ForgotPasswordScreen } from "@/components/auth/forgot-password-screen";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

/** Forgot password — built from Figma "Root" screen (node 148:79). */
export default async function ForgotPasswordPage() {
  const session = await auth();
  if (session?.user) {
    redirect("/flats");
  }

  return <ForgotPasswordScreen />;
}
