import { CreateAccountScreen } from "@/components/auth/create-account-screen";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

/** Create account — built from Figma "Root" screen (node 146:33). */
export default async function CreateAccountPage({
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

  return <CreateAccountScreen callbackUrl={callbackUrl} />;
}
