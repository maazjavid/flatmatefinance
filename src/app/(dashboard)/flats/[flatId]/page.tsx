import { FlatDetailsCard } from "@/components/flat/flat-details-card";
import { FlatHomeHeader } from "@/components/flat/flat-home-header";
import { MembersListCard } from "@/components/flat/members-list-card";
import { ShareInviteCard } from "@/components/flat/share-invite-card";
import { mockFlatDetails } from "@/lib/mocks/flats";

type FlatHomePageProps = {
  params: Promise<{ flatId: string }>;
};

/** Flat Home / Members — Figma node 57:2. */
export default async function FlatHomePage({ params }: FlatHomePageProps) {
  const { flatId: _flatId } = await params;

  // TODO: Phase 2 — replace with `GET /api/flats/:flatId` (and `/members`)
  const flat = mockFlatDetails;

  return (
    <div className="flex flex-col gap-6">
      <FlatHomeHeader
        flatName={flat.name}
        memberCount={flat.members.length}
        inviteStatus={flat.inviteStatus}
      />

      <ShareInviteCard flatName={flat.name} inviteCode={flat.inviteCode} />

      <FlatDetailsCard
        createdByName={flat.createdByName}
        createdAtLabel={flat.createdAtLabel}
        memberCount={flat.members.length}
      />

      <MembersListCard members={flat.members} />
    </div>
  );
}
