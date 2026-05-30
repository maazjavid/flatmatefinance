import { prisma } from "@/lib/prisma";
import { generateInviteCode } from "@/lib/flat-invite-code";
import type {
  CreateFlatInput,
  CreateFlatResponse,
  FlatDetails,
  FlatMember,
  FlatRole,
  FlatSummary,
  GetFlatResponse,
  GetMembersResponse,
  JoinFlatInput,
  JoinFlatResponse,
  ListFlatsResponse,
  ShareInviteResponse,
} from "@/lib/types/flat";

/**
 * Single server-side service module for the flat domain.
 *
 * Used by both:
 * - Server Components / Layouts (called directly, no internal HTTP)
 * - `/api/flats/**` route handlers (called from the client UI)
 */

class FlatServiceError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export { FlatServiceError };

const ROLE_ADMIN: FlatRole = "admin";
const ROLE_MEMBER: FlatRole = "member";

function normaliseRole(dbRole: string, isCreator: boolean): FlatRole {
  // Schema stores "ADMIN" | "MEMBER". The first ADMIN of a flat is treated
  // as the "owner" for UI purposes.
  if (isCreator) return "owner";
  if (dbRole === "ADMIN") return ROLE_ADMIN;
  return ROLE_MEMBER;
}

function formatDate(date: Date): string {
  // Matches Figma label format ("12 Mar 2025").
  return date.toLocaleDateString("en-NZ", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export async function listFlatsForUser(userId: string): Promise<ListFlatsResponse> {
  const memberships = await prisma.flatMember.findMany({
    where: { userId, status: "ACTIVE" },
    include: {
      flat: {
        include: {
          _count: { select: { members: { where: { status: "ACTIVE" } } } },
        },
      },
    },
    orderBy: { joinedAt: "asc" },
  });

  const flats: FlatSummary[] = memberships.map((m) => ({
    id: m.flat.id,
    name: m.flat.name,
    inviteCode: m.flat.inviteCode,
    memberCount: m.flat._count.members,
  }));

  return { flats };
}

export async function createFlatForUser(
  userId: string,
  input: CreateFlatInput,
): Promise<CreateFlatResponse> {
  // Up to 5 retries in the (extremely unlikely) case of an invite-code collision.
  for (let attempt = 0; attempt < 5; attempt++) {
    const inviteCode = generateInviteCode();
    try {
      const flat = await prisma.$transaction(async (tx) => {
        const created = await tx.flat.create({
          data: {
            name: input.name,
            inviteCode,
            members: { create: { userId, role: "ADMIN" } },
          },
        });
        return created;
      });

      return {
        flat: {
          id: flat.id,
          name: flat.name,
          inviteCode: flat.inviteCode,
          memberCount: 1,
        },
      };
    } catch (error) {
      const code = (error as { code?: string }).code;
      if (code === "P2002") continue; // inviteCode collision — retry
      throw error;
    }
  }
  throw new FlatServiceError("Could not generate a unique invite code.", 500);
}

export async function joinFlatForUser(
  userId: string,
  input: JoinFlatInput,
): Promise<JoinFlatResponse> {
  const inviteCode = input.inviteCode.trim().toUpperCase();

  const flat = await prisma.flat.findUnique({
    where: { inviteCode },
    include: { _count: { select: { members: true } } },
  });

  if (!flat) {
    throw new FlatServiceError("Invite code not found.", 404);
  }

  // Idempotent: re-joining reactivates a previously removed membership.
  await prisma.flatMember.upsert({
    where: { flatId_userId: { flatId: flat.id, userId } },
    update: { status: "ACTIVE", removedAt: null },
    create: { flatId: flat.id, userId, role: "MEMBER" },
  });

  const memberCount = await prisma.flatMember.count({
    where: { flatId: flat.id, status: "ACTIVE" },
  });

  return {
    flat: {
      id: flat.id,
      name: flat.name,
      inviteCode: flat.inviteCode,
      memberCount,
    },
  };
}

async function assertMembership(userId: string, flatId: string): Promise<void> {
  const exists = await prisma.flatMember.findUnique({
    where: { flatId_userId: { flatId, userId } },
    select: { id: true, status: true },
  });
  if (!exists || exists.status !== "ACTIVE") {
    throw new FlatServiceError("Flat not found.", 404);
  }
}

export async function getFlatById(
  userId: string,
  flatId: string,
): Promise<GetFlatResponse> {
  await assertMembership(userId, flatId);

  const flat = await prisma.flat.findUnique({
    where: { id: flatId },
    include: {
      members: {
        where: { status: "ACTIVE" },
        include: { user: { select: { id: true, name: true, email: true } } },
        orderBy: { joinedAt: "asc" },
      },
    },
  });

  if (!flat) {
    throw new FlatServiceError("Flat not found.", 404);
  }

  // Creator = the first ADMIN that joined (smallest joinedAt). Used for UI labels only.
  const creator = flat.members.find((m) => m.role === "ADMIN") ?? flat.members[0];

  const members: FlatMember[] = flat.members.map((m) => ({
    id: m.user.id,
    fullName: m.user.name || m.user.email,
    role: normaliseRole(m.role, m.id === creator?.id),
  }));

  const details: FlatDetails = {
    id: flat.id,
    name: flat.name,
    inviteCode: flat.inviteCode,
    createdByName: creator?.user.name || creator?.user.email || "Unknown",
    createdAtLabel: formatDate(flat.createdAt),
    inviteStatus: "active",
    members,
  };

  return { flat: details };
}

export async function getFlatMembers(
  userId: string,
  flatId: string,
): Promise<GetMembersResponse> {
  await assertMembership(userId, flatId);

  const memberships = await prisma.flatMember.findMany({
    where: { flatId, status: "ACTIVE" },
    include: { user: { select: { id: true, name: true, email: true } } },
    orderBy: { joinedAt: "asc" },
  });

  const creatorId = memberships.find((m) => m.role === "ADMIN")?.id ?? memberships[0]?.id;
  const members: FlatMember[] = memberships.map((m) => ({
    id: m.user.id,
    fullName: m.user.name || m.user.email,
    role: normaliseRole(m.role, m.id === creatorId),
  }));

  return { members };
}

export async function recordShareInvite(
  userId: string,
  flatId: string,
): Promise<ShareInviteResponse> {
  // Authorise first — share endpoints shouldn't reveal membership state.
  await assertMembership(userId, flatId);
  // No-op for now; this is the hook for analytics / invite-code rotation later.
  return { ok: true };
}
