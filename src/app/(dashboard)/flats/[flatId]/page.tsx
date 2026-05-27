import { auth } from "@/auth";
import { notFound, redirect } from "next/navigation";
import { FlatCreatedView } from "@/components/flat/flat-created-view";
import { FlatDetailsCard } from "@/components/flat/flat-details-card";
import { FlatHomeHeader } from "@/components/flat/flat-home-header";
import { FlatSummaryCard } from "@/components/flat/flat-summary-card";
import { MembersListCard } from "@/components/flat/members-list-card";
import { FlatServiceError, getFlatById } from "@/lib/services/flats";

type FlatHomePageProps = {
  params: Promise<{ flatId: string }>;
  searchParams?: Promise<{ created?: string }>;
};

/** Flat Home / Members — Figma node 57:2 (and the post-create 162:2 success state). */
export default async function FlatHomePage({ params, searchParams }: FlatHomePageProps) {
  const { flatId } = await params;
  const sp = (await searchParams) ?? {};
  const isCreatedState = sp.created === "1";

  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!session?.user || !userId) {
    redirect(`/sign-in?next=${encodeURIComponent(`/flats/${flatId}`)}`);
  }

  let flat;
  try {
    ({ flat } = await getFlatById(userId, flatId));
  } catch (error) {
    if (error instanceof FlatServiceError && error.status === 404) {
      notFound();
    }
    throw error;
  }

  if (isCreatedState) {
    return (
      <FlatCreatedView
        flatId={flat.id}
        flatName={flat.name}
        inviteCode={flat.inviteCode}
      />
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <FlatHomeHeader
        flatId={flat.id}
        flatName={flat.name}
        inviteCode={flat.inviteCode}
      />

      <FlatSummaryCard
        flatId={flat.id}
        flatName={flat.name}
        memberCount={flat.members.length}
        inviteCode={flat.inviteCode}
      />

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <MembersListCard members={flat.members} />
        <FlatDetailsCard
          createdByName={flat.createdByName}
          createdAtLabel={flat.createdAtLabel}
          inviteStatus={flat.inviteStatus}
        />
      </div>
    </div>
  );
}
