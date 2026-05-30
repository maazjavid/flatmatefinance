import { auth } from "@/auth";
import { FlatServiceError, joinFlatForUser } from "@/lib/services/flats";
import { redirect } from "next/navigation";

type JoinPageProps = {
  searchParams?: Promise<{ code?: string }>;
};

/** Invite link landing page — `/join?code=XXXX`. Sends new users to sign-up first. */
export default async function JoinPage({ searchParams }: JoinPageProps) {
  const params = (await searchParams) ?? {};
  const code = typeof params.code === "string" ? params.code.trim().toUpperCase() : "";

  if (!code) {
    redirect("/flats");
  }

  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;

  if (!session?.user || !userId) {
    redirect(`/create-account?next=${encodeURIComponent(`/join?code=${code}`)}`);
  }

  try {
    const { flat } = await joinFlatForUser(userId, { inviteCode: code });
    redirect(`/flats/${flat.id}`);
  } catch (error) {
    if (error instanceof FlatServiceError) {
      redirect(`/flats?joinError=${encodeURIComponent(error.message)}`);
    }
    throw error;
  }
}
