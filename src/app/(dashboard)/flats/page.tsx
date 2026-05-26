import { EmptyFlatsState } from "@/components/flat/empty-flats-state";
import { mockUserFlats } from "@/lib/mocks/flats";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

/**
 * Post-login landing page for the flat flow.
 * - If the user has no flats → render the "No Flats / Welcome" state (Figma 138:2).
 * - If they have at least one flat → redirect to the first one for MVP.
 *   (A real flats list/picker will come in a later phase.)
 */
export default async function FlatsPage() {
  const session = await auth();
  if (!session?.user) {
    redirect(`/sign-in?next=${encodeURIComponent("/flats")}`);
  }

  // TODO: Phase 2 — replace with `GET /api/flats` for the authenticated user
  const flats = mockUserFlats;

  if (flats.length > 0) {
    redirect(`/flats/${flats[0]!.id}`);
  }

  return <EmptyFlatsState />;
}
