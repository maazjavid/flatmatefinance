import { SignInScreen } from "@/components/auth/sign-in-screen";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

/** Sign in — built from Figma "Root" sign-in screen (node 146:5). */
export default async function SignInPage({
  searchParams,
}: {
  searchParams?: Promise<{ next?: string }>;
}) {
  const session = await auth();
  if (session?.user) {
    redirect("/flats");
  }

  const params = (await searchParams) ?? {};
  const callbackUrl =
    typeof params.next === "string" && params.next.length > 0 ? params.next : "/flats";

  return <SignInScreen callbackUrl={callbackUrl} />;
}
