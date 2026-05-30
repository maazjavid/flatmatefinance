/**
 * Build shareable join URLs and message text for flat invites.
 */
export function normaliseInviteCode(inviteCode: string): string {
  return inviteCode.trim().toUpperCase();
}

export function buildFlatDetailsPath(flatId: string): string {
  return `/flats/${flatId}`;
}

export function buildFlatDetailsUrl(flatId: string, appUrl: string): string {
  const base = appUrl.replace(/\/$/, "");
  return `${base}${buildFlatDetailsPath(flatId)}`;
}

export function buildAuthLinksForFlat(flatId: string, appUrl: string) {
  const base = appUrl.replace(/\/$/, "");
  const flatPath = buildFlatDetailsPath(flatId);
  const next = encodeURIComponent(flatPath);

  return {
    flatUrl: `${base}${flatPath}`,
    signInUrl: `${base}/sign-in?next=${next}`,
    createAccountUrl: `${base}/create-account?next=${next}`,
  };
}

/** HTML + plain-text footer for rent/payment emails with flat links. */
export function buildFlatDetailsEmailLinks(flatId: string, flatName: string, appUrl: string) {
  const { flatUrl, signInUrl, createAccountUrl } = buildAuthLinksForFlat(flatId, appUrl);

  return {
    html: `
      <p><a href="${flatUrl}">View flat details</a> for <strong>${flatName}</strong>.</p>
      <p>Not signed in? <a href="${signInUrl}">Sign in</a> or <a href="${createAccountUrl}">create an account</a> — you'll return to this flat afterwards.</p>
    `,
    text: [
      `View flat details: ${flatUrl}`,
      `Not signed in? Sign in: ${signInUrl}`,
      `Or create an account: ${createAccountUrl}`,
    ].join("\n"),
  };
}

export function buildJoinFlatPath(inviteCode: string): string {
  return `/join?code=${encodeURIComponent(normaliseInviteCode(inviteCode))}`;
}

export function buildJoinFlatUrl(inviteCode: string, appUrl: string): string {
  const base = appUrl.replace(/\/$/, "");
  return `${base}${buildJoinFlatPath(inviteCode)}`;
}

export function buildShareInviteMessage(
  flatName: string,
  inviteCode: string,
  appUrl: string,
): string {
  const code = normaliseInviteCode(inviteCode);
  const joinUrl = buildJoinFlatUrl(code, appUrl);

  return [
    `Join "${flatName}" on FlatMate Finance`,
    "",
    `Invite code: ${code}`,
    `Join link: ${joinUrl}`,
    "",
    "How to join:",
    "1. Open the join link above",
    "2. Create a free account (or sign in if you already have one)",
    "3. You'll be added to the flat automatically",
  ].join("\n");
}

export function resolveClientAppUrl(): string {
  if (typeof window !== "undefined" && window.location.origin) {
    return window.location.origin;
  }
  return process.env.NEXT_PUBLIC_APP_URL?.trim() || "http://localhost:3000";
}
