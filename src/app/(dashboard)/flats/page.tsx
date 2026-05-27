import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { EmptyFlatsState } from "@/components/flat/empty-flats-state";
import { listFlatsForUser } from "@/lib/services/flats";

/**
 * Post-login landing page.
 * - No flats → centered welcome card (Figma node 138:2).
 * - One+ flats → redirect to the first one; the sidebar list lets the user
 *   switch from there.
 */
export default async function FlatsPage() {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!session?.user || !userId) {
    redirect(`/sign-in?next=${encodeURIComponent("/flats")}`);
  }

  const { flats } = await listFlatsForUser(userId);
  if (flats.length > 0) {
    redirect(`/flats/${flats[0]!.id}`);
  }

  return <EmptyFlatsState />;
}
