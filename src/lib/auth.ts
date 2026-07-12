import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

const RATE_LIMIT_WINDOW = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const loginAttempts = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const entry = loginAttempts.get(key);
  if (!entry || now > entry.resetAt) {
    loginAttempts.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return true;
  }
  if (entry.count >= MAX_ATTEMPTS) return false;
  entry.count++;
  return true;
}

export const authOptions: NextAuthOptions = {
  debug: process.env.NODE_ENV === "development",
  providers: [
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
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const email = credentials.email.toLowerCase().trim();
        const ipKey = `login:${email}`;
        if (!checkRateLimit(ipKey)) {
          throw new Error("Too many login attempts. Please try again later.");
        }
        const dbUser = await db.user.findUnique({
          where: { email },
          include: { wallet: true },
        });
        if (!dbUser) return null;
        if (!dbUser.password) return null;
        const valid = await bcrypt.compare(credentials.password, dbUser.password);
        if (!valid) return null;
        await db.user.update({
          where: { id: dbUser.id },
          data: { lastLoginAt: new Date() },
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
      },
    }),
  ],
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider === "google") {
        if (!profile?.email) return false;

        let dbUser = await db.user.findUnique({
          where: { email: profile.email },
        });

        if (!dbUser) {
          const name = profile.name || profile.email.split("@")[0];
          dbUser = await db.user.create({
            data: {
              googleId: profile.sub,
              email: profile.email,
              name,
              avatar: profile.image,
              role: "USER",
              status: "ACTIVE",
              emailVerified: true,
              lastLoginAt: new Date(),
            },
          });

          await db.wallet.create({
            data: { userId: dbUser.id, coinBalance: 0, totalEarned: 0, totalSpent: 0 },
          });

          await db.userProfile.create({ data: { userId: dbUser.id } });

          await db.auditLog.create({
            data: { actorId: dbUser.id, action: "USER_REGISTERED" },
          });
        } else {
          if (!dbUser.googleId) {
            await db.user.update({
              where: { id: dbUser.id },
              data: { googleId: profile.sub, lastLoginAt: new Date() },
            });
          } else {
            await db.user.update({
              where: { id: dbUser.id },
              data: { lastLoginAt: new Date() },
            });
          }
        }

        return true;
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        const dbUser = await db.user.findUnique({
          where: { email: user.email! },
          include: { wallet: true },
        });
        if (dbUser) {
          token.uid = dbUser.id;
          token.role = dbUser.role;
          token.passwordChangedAt = dbUser.passwordChangedAt?.getTime() ?? 0;
        }
      }
      if (account?.provider === "google") {
        const dbUser = await db.user.findUnique({
          where: { email: token.email! },
        });
        if (dbUser) {
          token.uid = dbUser.id;
          token.role = dbUser.role;
          token.passwordChangedAt = dbUser.passwordChangedAt?.getTime() ?? 0;
        }
      }

      if (token.passwordChangedAt && token.iat) {
        if (token.iat * 1000 < token.passwordChangedAt) {
          return {};
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.uid as string;
        session.user.role = token.role as string;
        session.user.iat = token.iat as number;
        session.user.exp = token.exp as number;
      }
      return session;
    },
  },
  pages: {
    signIn: "/",
    error: "/",
    newUser: "/earn",
  },
};
