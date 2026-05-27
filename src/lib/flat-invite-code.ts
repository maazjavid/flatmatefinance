import { randomBytes } from "crypto";

/**
 * Invite-code alphabet: uppercase letters + digits, with visually-confusable
 * chars (0/O, 1/I/L) removed so codes read cleanly on every device.
 */
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

/** Generates an 8-character invite code like `NZFLATO1`. */
export function generateInviteCode(): string {
  return randomChunk(8);
}

function randomChunk(length: number): string {
  // `randomBytes` gives uniformly random bytes; we map each to ALPHABET via
  // modulo. ALPHABET has 31 chars; modulo bias is negligible for invite codes.
  const bytes = randomBytes(length);
  let out = "";
  for (let i = 0; i < length; i++) {
    out += ALPHABET[bytes[i]! % ALPHABET.length];
  }
  return out;
}
