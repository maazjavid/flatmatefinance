import { prisma } from "@/lib/prisma";
import { FlatServiceError } from "@/lib/services/flats";

const MEMBER_ACTIVE = "ACTIVE";

type FlatMembershipRecord = {
  id: string;
  flatId: string;
  userId: string;
  role: string;
  status: string;
};

/**
 * Loads an active membership or returns 404 (same as "flat not found" for non-members).
 */
export async function requireActiveMembership(
  userId: string,
  flatId: string,
): Promise<FlatMembershipRecord> {
  const membership = await prisma.flatMember.findUnique({
    where: { flatId_userId: { flatId, userId } },
    select: { id: true, flatId: true, userId: true, role: true, status: true },
  });

  if (!membership || membership.status !== MEMBER_ACTIVE) {
    throw new FlatServiceError("Flat not found.", 404);
  }

  return membership;
}

/**
 * Owner (first ADMIN) and ADMIN role members can perform admin actions.
 */
export async function requireFlatAdmin(userId: string, flatId: string): Promise<FlatMembershipRecord> {
  const membership = await requireActiveMembership(userId, flatId);

  const memberships = await prisma.flatMember.findMany({
    where: { flatId, status: MEMBER_ACTIVE },
    orderBy: { joinedAt: "asc" },
    select: { id: true, role: true },
  });

  const creator = memberships.find((m) => m.role === "ADMIN") ?? memberships[0];
  const isAdmin = membership.role === "ADMIN" || membership.id === creator?.id;

  if (!isAdmin) {
    throw new FlatServiceError("Admin access required.", 403);
  }

  return membership;
}

export async function getActiveMemberUserIds(flatId: string): Promise<string[]> {
  const members = await prisma.flatMember.findMany({
    where: { flatId, status: MEMBER_ACTIVE },
    select: { userId: true },
  });
  return members.map((m) => m.userId);
}

/** Active flatmates who owe rent — admins are included in the split math but do not pay. */
export async function getPayingMemberUserIds(flatId: string): Promise<string[]> {
  const members = await prisma.flatMember.findMany({
    where: { flatId, status: MEMBER_ACTIVE },
    orderBy: { joinedAt: "asc" },
    select: { userId: true, role: true },
  });

  return members.filter((m) => m.role !== "ADMIN").map((m) => m.userId);
}

export function isRentCollectorRole(role: string): boolean {
  return role === "ADMIN";
}

/** Primary admin (first ADMIN) who receives payment proofs and reminders. */
export async function getFlatPrimaryAdmin(flatId: string) {
  const memberships = await prisma.flatMember.findMany({
    where: { flatId, status: MEMBER_ACTIVE, role: "ADMIN" },
    orderBy: { joinedAt: "asc" },
    include: { user: { select: { id: true, email: true, name: true } } },
    take: 1,
  });

  const admin = memberships[0];
  if (!admin) {
    throw new FlatServiceError("Flat admin not found.", 404);
  }

  return admin;
}
