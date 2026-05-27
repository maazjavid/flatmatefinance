import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

/**
 * Single auth system (NextAuth).
 * Providers:
 * - Credentials: email/password sign-in only. Account creation lives in
 *   `POST /api/auth/register` so Prisma errors aren't swallowed by Auth.js.
 * - Google: OAuth sign-in (and creates a user if missing).
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  // Use JWT sessions so route protection can work without a separate adapter schema.
  session: { strategy: "jwt" },
  secret: process.env.AUTH_SECRET,
  // Route NextAuth's built-in pages (e.g. /api/auth/signin, the error page) to
  // our custom Figma screens so users never see the default Auth.js UI.
  pages: {
    signIn: "/sign-in",
    error: "/sign-in",
  },
  providers: [
    CredentialsProvider({
      name: "Email and Password",
      credentials: {
        action: { label: "Action", type: "text" },
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const rawEmail = credentials?.email;
        const password = credentials?.password;

        if (typeof rawEmail !== "string" || rawEmail.length === 0) return null;
        if (typeof password !== "string" || password.length === 0) return null;

        const email = rawEmail.trim().toLowerCase();

        try {
          const user = await prisma.user.findUnique({ where: { email } });
          if (!user) return null;
          if (!user.passwordHash) return null; // Google-only user (no local password)

          const isValid = await bcrypt.compare(password, user.passwordHash);
          if (!isValid) return null;

          return { id: user.id, email: user.email, name: user.name };
        } catch (error) {
          console.error("[auth] credentials authorize error:", error);
          return null;
        }
      },
    }),
    ...(googleClientId && googleClientSecret
      ? [
          GoogleProvider({
            clientId: googleClientId,
            clientSecret: googleClientSecret,
          }),
        ]
      : []),
  ],
  callbacks: {
    async jwt({ token, user, account, profile }) {
      // Credentials provider: `user` returned from `authorize`.
      if (user?.id) {
        token.sub = String((user as { id: string }).id);
        return token;
      }

      // Google provider: create user if missing.
      if (account?.provider === "google") {
        const email = profile?.email;
        const nameFromProfile =
          profile?.name ||
          [profile?.given_name, profile?.family_name].filter(Boolean).join(" ").trim();

        if (typeof email !== "string" || email.length === 0) return token;

        const normalizedEmail = email.trim().toLowerCase();
        const name = nameFromProfile || "Google User";

        try {
          const dbUser = await prisma.user.upsert({
            where: { email: normalizedEmail },
            update: { name },
            create: { email: normalizedEmail, name, passwordHash: null },
          });
          token.sub = dbUser.id;
        } catch (error) {
          console.error("[auth] google upsert error:", error);
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        // NextAuth's default `session.user` doesn't include `id`; we add it.
        session.user = { ...(session.user as any), id: token.sub } as any;
      }

      return session;
    },
  },
});
