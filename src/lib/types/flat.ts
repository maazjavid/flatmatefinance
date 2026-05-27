/**
 * Phase 2 API-ready contracts for the flat domain.
 * These match the shapes Phase 2 endpoints (see README routes) will return,
 * so UI components can stay stable when real data replaces mocks.
 */

export type FlatRole = "owner" | "admin" | "member";

export type FlatInviteStatus = "active" | "inactive";

export type FlatSummary = {
  id: string;
  name: string;
  inviteCode: string;
  memberCount: number;
};

export type FlatMember = {
  id: string;
  fullName: string;
  role: FlatRole;
};

export type FlatDetails = {
  id: string;
  name: string;
  inviteCode: string;
  createdByName: string;
  createdAtLabel: string;
  inviteStatus: FlatInviteStatus;
  members: FlatMember[];
};

// ---------------------------------------------------------------------------
// Request / response payloads (one per future endpoint).
// Keep these in sync with `src/lib/services/flats.ts` and the `/api/flats/**`
// route handlers.
// ---------------------------------------------------------------------------

export type CreateFlatInput = {
  name: string;
};

export type CreateFlatResponse = {
  flat: FlatSummary;
};

export type JoinFlatInput = {
  inviteCode: string;
};

export type JoinFlatResponse = {
  flat: FlatSummary;
};

export type ListFlatsResponse = {
  flats: FlatSummary[];
};

export type GetFlatResponse = {
  flat: FlatDetails;
};

export type GetMembersResponse = {
  members: FlatMember[];
};

export type ShareInviteResponse = {
  ok: true;
};

export type ApiError = {
  ok: false;
  error: string;
};
