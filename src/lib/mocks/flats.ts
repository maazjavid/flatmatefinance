import type { FlatDetails, FlatSummary } from "@/lib/types/flat";

/**
 * Static fixtures used until Phase 2 wires real API calls.
 * Keep these shapes identical to the Phase 2 contracts.
 */

// TODO: Phase 2 — replace with `GET /api/flats` for the authenticated user
export const mockUserFlats: FlatSummary[] = [];

// TODO: Phase 2 — replace with `GET /api/flats/:flatId`
export const mockFlatDetails: FlatDetails = {
  id: "flat-demo",
  name: "Sunny Apartments",
  inviteCode: "SUN-4F2K9",
  createdByName: "Alex Chen",
  createdAtLabel: "Created May 2026",
  inviteStatus: "active",
  members: [
    { id: "u1", fullName: "Alex Chen", role: "owner" },
    { id: "u2", fullName: "Priya Shah", role: "admin" },
    { id: "u3", fullName: "Marcus Lee", role: "member" },
    { id: "u4", fullName: "Sofia Romero", role: "member" },
  ],
};
