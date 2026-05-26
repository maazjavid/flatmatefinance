import { SignInScreen } from "@/components/auth/sign-in-screen";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

/** Sign in — built from Figma "Root" sign-in screen (node 146:5). */
export default async function SignInPage({
  searchParams,
}: {
  searchParams?: { next?: string };
}) {
  const session = await auth();
  if (session?.user) {
    redirect("/flats");
  }

  const callbackUrl =
    typeof searchParams?.next === "string" && searchParams.next.length > 0
      ? searchParams.next
      : "/flats";

  return <SignInScreen callbackUrl={callbackUrl} />;
}
