import NextAuth from "next-auth";

/**
 * Auth is stubbed for scaffold. Add providers (e.g. Credentials, Google)
 * and wire `AUTH_SECRET` before enabling protected routes.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [],
  session: { strategy: "jwt" },
});
