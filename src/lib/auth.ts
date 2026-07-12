import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@/lib/db";

/**
 * NextAuth.js configuration.
 *
 * Providers:
 * 1. Google — production authentication (requires real GOOGLE_CLIENT_ID/SECRET)
 * 2. Credentials — development/demo login (creates real user + wallet in DB)
 *
 * No PrismaAdapter — user creation handled manually in authorize/events.
 */
export const authOptions: NextAuthOptions = {
  providers: [
    // Google OAuth (production) — only enabled if real credentials are set
    ...(process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_SECRET &&
    process.env.GOOGLE_CLIENT_ID !== "your-google-client-id.apps.googleusercontent.com"
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
    // Credentials provider (development/demo) — always enabled
    CredentialsProvider({
      name: "Demo Login",
      credentials: {
        name: { label: "Name", type: "text", placeholder: "Your Name" },
        email: { label: "Email", type: "email", placeholder: "you@example.com" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email) {
            return null;
          }

          const name = credentials.name || "LootLoom User";
          const email = credentials.email.toLowerCase().trim();

          // Find or create the user
          let dbUser = await db.user.findUnique({
            where: { email },
            include: { wallet: true },
          });

          if (!dbUser) {
            // Create new user with a demo googleId
            dbUser = await db.user.create({
              data: {
                googleId: `demo-${email}`,
                name,
                email,
                avatar: null,
                role: "USER",
                status: "ACTIVE",
                lastLoginAt: new Date(),
              },
              include: { wallet: true },
            });

            // Create wallet (0 balance — no fake coins)
            await db.wallet.create({
              data: { userId: dbUser.id, coinBalance: 0, totalEarned: 0, totalSpent: 0 },
            });

            // Create profile
            await db.userProfile.create({ data: { userId: dbUser.id } });

            // Audit log
            await db.auditLog.create({
              data: { actorId: dbUser.id, action: "USER_REGISTERED" },
            });
          }

          // Update last login
          await db.user.update({
            where: { id: dbUser.id },
            data: { lastLoginAt: new Date(), name },
          });

          await db.auditLog.create({
            data: { actorId: dbUser.id, action: "USER_LOGIN" },
          });

          return {
            id: dbUser.id,
            name: dbUser.name,
            email: dbUser.email,
            image: dbUser.avatar,
          };
        } catch {
          return null;
        }
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        // First sign-in or token refresh — attach real user data
        const dbUser = await db.user.findUnique({
          where: { email: user.email! },
          include: { wallet: true },
        });
        if (dbUser) {
          token.uid = dbUser.id;
          token.role = dbUser.role;
          token.googleId = dbUser.googleId;
          // Update last login on sign-in (for Google provider, since Credentials handles it in authorize)
          if (trigger === "signIn" && !token.loginLogged) {
            token.loginLogged = true;
          }
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.uid as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/",
    error: "/",
  },
};
