import { CreateAccountScreen } from "@/components/auth/create-account-screen";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

/** Create account — built from Figma "Root" screen (node 146:33). */
export default async function CreateAccountPage({
  searchParams,
}: {
  searchParams?: Promise<{ next?: string }>;
}) {
  const params = (await searchParams) ?? {};
  const callbackUrl =
    typeof params.next === "string" && params.next.length > 0 ? params.next : "/flats";

  const session = await auth();
  if (session?.user) {
    redirect(callbackUrl);
  }

  const isInviteJoin = callbackUrl.startsWith("/join?");

  return (
    <CreateAccountScreen callbackUrl={callbackUrl} isInviteJoin={isInviteJoin} />
  );
}
