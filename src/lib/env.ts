/**
 * Normalizes env values (strips wrapping quotes from .env files).
 */
export function readEnv(name: string): string | undefined {
  const raw = process.env[name];
  if (!raw) return undefined;
  const trimmed = raw.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1).trim();
  }
  return trimmed;
}

/** Public site URL used in emails and client-side links. */
export function getAppUrl(): string | undefined {
  return (
    readEnv("NEXT_PUBLIC_APP_URL") ??
    readEnv("AUTH_URL") ??
    readEnv("NEXTAUTH_URL") ??
    readEnv("APP_URL")
  );
}

/**
 * Resend `from` address — `Name <email@domain>` or plain email.
 * Prefer EMAIL_FROM, then RESEND_FROM_EMAIL.
 */
export function getEmailFromAddress(): string | undefined {
  return readEnv("EMAIL_FROM") ?? readEnv("RESEND_FROM_EMAIL");
}
