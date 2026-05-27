import { NextResponse } from "next/server";
import { auth } from "@/auth";

export type AuthenticatedSession = {
  userId: string;
  email: string;
  name: string | null;
};

/**
 * Helper used by every `/api/flats/**` route handler.
 *
 * Returns either:
 *   - `{ session }` with a non-null userId, OR
 *   - `{ response }` containing a 401 JSON response to return immediately.
 *
 * Centralising the shape keeps each route handler small.
 */
export async function requireSession(): Promise<
  | { session: AuthenticatedSession; response?: undefined }
  | { session?: undefined; response: NextResponse }
> {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;

  if (!session?.user || !userId) {
    return {
      response: NextResponse.json(
        { ok: false, error: "Unauthorized." },
        { status: 401 },
      ),
    };
  }

  return {
    session: {
      userId,
      email: session.user.email ?? "",
      name: session.user.name ?? null,
    },
  };
}
