import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";

/**
 * NextAuth.js configuration — Google Sign-In only.
 * Real user creation/login via Prisma. No fake auth.
 */
export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
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
          // Update last login
          if (trigger === "signIn") {
            await db.user.update({
              where: { id: dbUser.id },
              data: { lastLoginAt: new Date() },
            });
            await db.auditLog.create({
              data: {
                actorId: dbUser.id,
                action: "USER_LOGIN",
              },
            });
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
  events: {
    async createUser({ user }) {
      // Automatic wallet creation on first signup — zero balance, no fake coins
      const existingWallet = await db.wallet.findUnique({
        where: { userId: user.id },
      });
      if (!existingWallet) {
        await db.wallet.create({
          data: { userId: user.id, coinBalance: 0, totalEarned: 0, totalSpent: 0 },
        });
      }
      // Create default profile
      const existingProfile = await db.userProfile.findUnique({
        where: { userId: user.id },
      });
      if (!existingProfile) {
        await db.userProfile.create({ data: { userId: user.id } });
      }
      // Audit log
      await db.auditLog.create({
        data: { actorId: user.id, action: "USER_REGISTERED" },
      });
    },
  },
  pages: {
    signIn: "/",
    error: "/",
  },
};
