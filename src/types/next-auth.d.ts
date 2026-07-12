import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      iat?: number;
      exp?: number;
    } & DefaultSession["user"];
  }

  interface JWT {
    uid: string;
    role: string;
    passwordChangedAt: number;
  }
}
