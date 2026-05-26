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
 * - Credentials: email/password sign-in + email/password create account
 * - Google: OAuth sign-in (and creates a user if missing)
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  // Use JWT sessions so route protection can work without a separate adapter schema.
  session: { strategy: "jwt" },
  secret: process.env.AUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: "Email and Password",
      credentials: {
        action: { label: "Action", type: "text" },
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        firstName: { label: "First name", type: "text" },
        lastName: { label: "Last name", type: "text" },
        confirmPassword: { label: "Confirm password", type: "password" },
      },
      async authorize(credentials) {
        const action = credentials?.action;
        const email = credentials?.email?.trim().toLowerCase();

        if (!email || typeof email !== "string") return null;

        if (action === "signup") {
          const password = credentials?.password;
          const confirmPassword = credentials?.confirmPassword;
          const firstName = credentials?.firstName?.trim();
          const lastName = credentials?.lastName?.trim();

          if (
            typeof password !== "string" ||
            typeof confirmPassword !== "string" ||
            password.length === 0 ||
            confirmPassword.length === 0 ||
            typeof firstName !== "string" ||
            firstName.length === 0 ||
            typeof lastName !== "string" ||
            lastName.length === 0
          ) {
            return null;
          }

          if (password !== confirmPassword) return null;

          const name = `${firstName} ${lastName}`.trim();
          const passwordHash = await bcrypt.hash(password, 10);

          // Create-or-update so re-signing up with the same email works cleanly.
          const user = await prisma.user.upsert({
            where: { email },
            update: { name, passwordHash },
            create: { email, name, passwordHash },
          });

          return { id: user.id, email: user.email, name: user.name };
        }

        // Default: sign-in.
        const password = credentials?.password;
        if (typeof password !== "string" || password.length === 0) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return null;
        if (!user.passwordHash) return null; // Google-only user (no local password)

        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) return null;

        return { id: user.id, email: user.email, name: user.name };
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

        const dbUser = await prisma.user.upsert({
          where: { email: normalizedEmail },
          update: { name },
          create: { email: normalizedEmail, name, passwordHash: null },
        });

        token.sub = dbUser.id;
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
