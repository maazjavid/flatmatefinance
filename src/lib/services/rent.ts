import { getAppUrl, getEmailFromAddress } from "@/lib/env";
import { buildFlatDetailsEmailLinks } from "@/lib/flat-invite-link";
import { prisma } from "@/lib/prisma";
import {
  getFlatPrimaryAdmin,
  isRentCollectorRole,
  requireActiveMembership,
  requireFlatAdmin,
} from "@/lib/services/flat-access";
import { FlatServiceError } from "@/lib/services/flats";
import {
  buildProofStorageKey,
  readPaymentProof,
  storePaymentProof,
} from "@/lib/storage/payment-proof";
import type { FlatRole } from "@/lib/types/flat";
import type {
  CreateRentInput,
  FlatBalances,
  MemberBalanceRow,
  MemberRentSplit,
  RentSplitStatus,
} from "@/lib/types/rent";
import { Resend } from "resend";

const ROLE_ADMIN = "ADMIN";
const SPLIT_OWING = "OWING";
const SPLIT_PAID = "PAID";

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-NZ", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function normaliseRole(dbRole: string, isCreator: boolean): FlatRole {
  if (isCreator) return "owner";
  if (dbRole === ROLE_ADMIN) return "admin";
  return "member";
}

function normaliseSplitStatus(status: string): RentSplitStatus {
  return status === SPLIT_PAID ? "paid" : "owing";
}

function splitEvenly(totalCents: number, memberCount: number): number[] {
  if (memberCount <= 0) {
    throw new FlatServiceError("No paying members to split rent.", 400);
  }

  const base = Math.floor(totalCents / memberCount);
  const remainder = totalCents % memberCount;
  return Array.from({ length: memberCount }, (_, index) =>
    index < remainder ? base + 1 : base,
  );
}

async function loadFlatContext(flatId: string) {
  const memberships = await prisma.flatMember.findMany({
    where: { flatId, status: "ACTIVE" },
    include: { user: { select: { id: true, name: true, email: true } } },
    orderBy: { joinedAt: "asc" },
  });

  const creatorMembershipId =
    memberships.find((m) => m.role === ROLE_ADMIN)?.id ?? memberships[0]?.id;

  return { memberships, creatorMembershipId };
}

function mapSplit(
  split: {
    id: string;
    rentChargeId: string;
    amountCents: number;
    status: string;
    notificationCount: number;
    lastNotifiedAt: Date | null;
    proofFileName: string | null;
    proofStorageKey: string | null;
    rentCharge: { label: string | null; dueDate: Date | null };
  },
): MemberRentSplit {
  return {
    id: split.id,
    rentChargeId: split.rentChargeId,
    label: split.rentCharge.label,
    dueDateLabel: split.rentCharge.dueDate ? formatDate(split.rentCharge.dueDate) : null,
    amountCents: split.amountCents,
    status: normaliseSplitStatus(split.status),
    notificationCount: split.notificationCount,
    lastNotifiedAtLabel: split.lastNotifiedAt ? formatDate(split.lastNotifiedAt) : null,
    hasProof: Boolean(split.proofStorageKey || split.proofFileName),
    proofFileName: split.proofFileName,
  };
}

export async function getFlatBalances(userId: string, flatId: string): Promise<FlatBalances> {
  await requireActiveMembership(userId, flatId);
  const { memberships, creatorMembershipId } = await loadFlatContext(flatId);

  const splits = await prisma.rentSplit.findMany({
    where: { rentCharge: { flatId } },
    include: {
      rentCharge: { select: { label: true, dueDate: true, amountCents: true } },
      user: { select: { id: true, name: true, email: true } },
    },
    orderBy: [{ rentCharge: { createdAt: "desc" } }, { userId: "asc" }],
  });

  const activeUserIds = new Set(memberships.map((m) => m.userId));
  const activeSplits = splits.filter((split) => activeUserIds.has(split.userId));

  const totalRentCents = await prisma.rentCharge.aggregate({
    where: { flatId },
    _sum: { amountCents: true },
  });

  const totalOutstandingCents = activeSplits
    .filter((split) => split.status === SPLIT_OWING)
    .reduce((sum, split) => sum + split.amountCents, 0);

  const nextDue = await prisma.rentCharge.findFirst({
    where: { flatId, dueDate: { not: null } },
    orderBy: { dueDate: "asc" },
    select: { dueDate: true },
  });

  const viewerMembership = memberships.find((m) => m.userId === userId);
  const isAdmin =
    viewerMembership?.role === ROLE_ADMIN ||
    viewerMembership?.id === creatorMembershipId;

  const viewerOwedCents =
    isAdmin || !viewerMembership
      ? 0
      : activeSplits
          .filter((split) => split.userId === userId && split.status === SPLIT_OWING)
          .reduce((sum, split) => sum + split.amountCents, 0);

  const viewerCollectableCents =
    isAdmin && viewerMembership
      ? activeSplits
          .filter((split) => split.status === SPLIT_OWING)
          .reduce((sum, split) => sum + split.amountCents, 0)
      : 0;

  const members: MemberBalanceRow[] = memberships.map((membership) => {
    const isRentCollector = isRentCollectorRole(membership.role);
    const memberSplits = activeSplits
      .filter((split) => split.userId === membership.userId)
      .map(mapSplit);

    const owedCents = memberSplits
      .filter((split) => split.status === "owing")
      .reduce((sum, split) => sum + split.amountCents, 0);
    const paidCents = memberSplits
      .filter((split) => split.status === "paid")
      .reduce((sum, split) => sum + split.amountCents, 0);

    return {
      userId: membership.userId,
      fullName: membership.user.name || membership.user.email,
      role: normaliseRole(membership.role, membership.id === creatorMembershipId),
      isRentCollector,
      owedCents,
      paidCents,
      splits: memberSplits,
    };
  });

  return {
    totalRentCents: totalRentCents._sum.amountCents ?? 0,
    totalOutstandingCents,
    activeMemberCount: memberships.length,
    nextDueDateLabel: nextDue?.dueDate ? formatDate(nextDue.dueDate) : null,
    viewerOwedCents,
    viewerCollectableCents,
    isAdmin: Boolean(isAdmin),
    members,
  };
}

export async function createRentCharge(
  userId: string,
  flatId: string,
  input: CreateRentInput,
): Promise<FlatBalances> {
  await requireFlatAdmin(userId, flatId);

  if (!Number.isInteger(input.amountCents) || input.amountCents <= 0) {
    throw new FlatServiceError("Enter a valid rent amount.", 400);
  }

  const { memberships } = await loadFlatContext(flatId);
  const hasPayingMembers = memberships.some((m) => m.role !== ROLE_ADMIN);
  if (!hasPayingMembers) {
    throw new FlatServiceError("Add flatmates before splitting rent.", 400);
  }

  const shareAmounts = splitEvenly(input.amountCents, memberships.length);

  const dueDate =
    input.dueDate && input.dueDate.trim().length > 0
      ? new Date(input.dueDate)
      : null;
  if (dueDate && Number.isNaN(dueDate.getTime())) {
    throw new FlatServiceError("Enter a valid due date.", 400);
  }

  await prisma.$transaction(async (tx) => {
    const charge = await tx.rentCharge.create({
      data: {
        flatId,
        amountCents: input.amountCents,
        dueDate,
        label: input.label?.trim() || null,
        createdById: userId,
      },
    });

    await tx.rentSplit.createMany({
      data: memberships.flatMap((membership, index) => {
        if (membership.role === ROLE_ADMIN) return [];
        return [
          {
            rentChargeId: charge.id,
            userId: membership.userId,
            amountCents: shareAmounts[index]!,
            status: SPLIT_OWING,
          },
        ];
      }),
    });
  });

  return getFlatBalances(userId, flatId);
}

export async function removeFlatMember(
  adminUserId: string,
  flatId: string,
  targetUserId: string,
): Promise<FlatBalances> {
  await requireFlatAdmin(adminUserId, flatId);

  if (adminUserId === targetUserId) {
    throw new FlatServiceError("You cannot remove yourself from the flat.", 400);
  }

  const target = await prisma.flatMember.findUnique({
    where: { flatId_userId: { flatId, userId: targetUserId } },
  });

  if (!target || target.status !== "ACTIVE") {
    throw new FlatServiceError("Member not found.", 404);
  }

  const { creatorMembershipId } = await loadFlatContext(flatId);
  if (target.id === creatorMembershipId) {
    throw new FlatServiceError("The flat owner cannot be removed.", 400);
  }

  await prisma.flatMember.update({
    where: { id: target.id },
    data: { status: "REMOVED", removedAt: new Date() },
  });

  return getFlatBalances(adminUserId, flatId);
}

async function loadSplitForFlat(splitId: string, flatId: string) {
  const split = await prisma.rentSplit.findUnique({
    where: { id: splitId },
    include: {
      rentCharge: { select: { flatId: true, label: true } },
      user: { select: { id: true, email: true, name: true } },
    },
  });

  if (!split || split.rentCharge.flatId !== flatId) {
    throw new FlatServiceError("Payment not found.", 404);
  }

  return split;
}

async function sendPaymentProofEmailToAdmin(
  flatId: string,
  split: {
    amountCents: number;
    proofFileName: string | null;
    proofStorageKey: string | null;
    user: { name: string; email: string };
    rentCharge: { label: string | null };
  },
): Promise<void> {
  if (!split.proofStorageKey || !split.proofFileName) {
    throw new FlatServiceError("Upload payment proof before marking as paid.", 400);
  }

  const proof = await readPaymentProof(split.proofStorageKey, split.proofFileName);
  if (!proof) {
    throw new FlatServiceError("Payment proof file not found. Upload it again.", 400);
  }

  const admin = await getFlatPrimaryAdmin(flatId);
  const resendApiKey = process.env.RESEND_API_KEY;
  const resendFrom = getEmailFromAddress();

  if (!resendApiKey || !resendFrom) {
    console.info(
      `[rent] member marked paid for split; proof stored but email not sent (missing RESEND config).`,
    );
    return;
  }

  const flat = await prisma.flat.findUnique({ where: { id: flatId }, select: { name: true } });
  const flatName = flat?.name ?? "your flat";
  const amount = (split.amountCents / 100).toFixed(2);
  const label = split.rentCharge.label ?? "rent";
  const appUrl = getAppUrl() ?? "http://localhost:3000";
  const flatLinks = buildFlatDetailsEmailLinks(flatId, flatName, appUrl);

  try {
    const resend = new Resend(resendApiKey);
    await resend.emails.send({
      from: resendFrom,
      to: admin.user.email,
      subject: `Payment submitted: ${split.user.name || split.user.email}`,
      html: `
        <p>Hi ${admin.user.name || "there"},</p>
        <p><strong>${split.user.name || split.user.email}</strong> marked their share of <strong>${label}</strong> as paid (${amount} NZD) in flat <strong>${flatName}</strong>.</p>
        <p>Their payment proof is attached.</p>
        ${flatLinks.html}
      `,
      text: [
        `${split.user.name || split.user.email} marked ${label} as paid (${amount} NZD) in ${flatName}. Payment proof attached.`,
        flatLinks.text,
      ].join("\n\n"),
      attachments: [
        {
          filename: proof.fileName,
          content: proof.buffer,
        },
      ],
    });
  } catch (error) {
    console.error("[rent] payment proof email failed:", error);
    throw new FlatServiceError("Could not email payment proof to admin. Try again.", 500);
  }
}

export async function sendRentReminder(
  adminUserId: string,
  flatId: string,
  splitId: string,
): Promise<FlatBalances> {
  await requireFlatAdmin(adminUserId, flatId);
  const split = await loadSplitForFlat(splitId, flatId);

  if (split.status !== SPLIT_OWING) {
    throw new FlatServiceError("This member has no outstanding balance for this charge.", 400);
  }

  const targetMembership = await prisma.flatMember.findUnique({
    where: { flatId_userId: { flatId, userId: split.userId } },
  });
  if (!targetMembership || targetMembership.status !== "ACTIVE") {
    throw new FlatServiceError("Member is not active in this flat.", 400);
  }

  if (isRentCollectorRole(targetMembership.role)) {
    throw new FlatServiceError("Admins collect rent — they do not receive payment reminders.", 400);
  }

  const now = new Date();
  await prisma.rentSplit.update({
    where: { id: splitId },
    data: {
      notificationCount: { increment: 1 },
      lastNotifiedAt: now,
    },
  });

  const resendApiKey = process.env.RESEND_API_KEY;
  const resendFrom = getEmailFromAddress();
  if (resendApiKey && resendFrom) {
    try {
      const flat = await prisma.flat.findUnique({
        where: { id: flatId },
        select: { name: true },
      });
      const flatName = flat?.name ?? "your flat";
      const appUrl = getAppUrl() ?? "http://localhost:3000";
      const flatLinks = buildFlatDetailsEmailLinks(flatId, flatName, appUrl);
      const resend = new Resend(resendApiKey);
      const amount = (split.amountCents / 100).toFixed(2);
      const label = split.rentCharge.label ?? "rent";
      await resend.emails.send({
        from: resendFrom,
        to: split.user.email,
        subject: `Rent reminder: ${label}`,
        html: `
          <p>Hi ${split.user.name || "there"},</p>
          <p>This is a reminder that your share of <strong>${label}</strong> is <strong>$${amount} NZD</strong> in flat <strong>${flatName}</strong>.</p>
          ${flatLinks.html}
        `,
        text: [
          `Your share of ${label} is $${amount} NZD in ${flatName}.`,
          flatLinks.text,
        ].join("\n\n"),
      });
    } catch (error) {
      console.error("[rent] reminder email failed:", error);
    }
  } else {
    console.info(
      `[rent] reminder recorded for split ${splitId}; email not sent (missing RESEND config).`,
    );
  }

  return getFlatBalances(adminUserId, flatId);
}

export async function markRentSplitPaid(
  actorUserId: string,
  flatId: string,
  splitId: string,
): Promise<FlatBalances> {
  await requireActiveMembership(actorUserId, flatId);
  const split = await loadSplitForFlat(splitId, flatId);

  const { creatorMembershipId } = await loadFlatContext(flatId);
  const actorMembership = await prisma.flatMember.findUnique({
    where: { flatId_userId: { flatId, userId: actorUserId } },
  });
  const isAdmin =
    actorMembership?.role === ROLE_ADMIN ||
    actorMembership?.id === creatorMembershipId;

  if (isRentCollectorRole(actorMembership?.role ?? "") && split.userId === actorUserId) {
    throw new FlatServiceError("Admins collect rent — no payment is required from you.", 400);
  }

  if (!isAdmin && split.userId !== actorUserId) {
    throw new FlatServiceError("You can only mark your own payments.", 403);
  }

  if (split.status === SPLIT_PAID) {
    return getFlatBalances(actorUserId, flatId);
  }

  if (!isAdmin) {
    if (!split.proofStorageKey && !split.proofFileName) {
      throw new FlatServiceError("Upload payment proof before marking as paid.", 400);
    }
    await sendPaymentProofEmailToAdmin(flatId, split);
  }

  await prisma.rentSplit.update({
    where: { id: splitId },
    data: { status: SPLIT_PAID, paidAt: new Date() },
  });

  return getFlatBalances(actorUserId, flatId);
}

export async function uploadRentPaymentProof(
  userId: string,
  flatId: string,
  splitId: string,
  file: File,
): Promise<FlatBalances> {
  await requireActiveMembership(userId, flatId);
  const split = await loadSplitForFlat(splitId, flatId);

  if (split.userId !== userId) {
    throw new FlatServiceError("You can only upload proof for your own payments.", 403);
  }

  const actorMembership = await prisma.flatMember.findUnique({
    where: { flatId_userId: { flatId, userId } },
    select: { role: true },
  });
  if (isRentCollectorRole(actorMembership?.role ?? "")) {
    throw new FlatServiceError("Admins collect rent — no proof upload is required.", 400);
  }

  if (split.status === SPLIT_PAID) {
    throw new FlatServiceError("This payment is already marked as paid.", 400);
  }

  const fileName = file.name.trim() || "payment-proof";
  const storageKey = buildProofStorageKey(flatId, splitId, fileName);

  await storePaymentProof(file, storageKey);

  await prisma.rentSplit.update({
    where: { id: splitId },
    data: {
      proofFileName: fileName,
      proofStorageKey: storageKey,
      proofUploadedAt: new Date(),
    },
  });

  return getFlatBalances(userId, flatId);
}
