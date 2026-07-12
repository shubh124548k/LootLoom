import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Next.js Middleware — server-side API route protection.
 * Public API routes (auth, stats, rewards, feature-flags, public, health) are excluded.
 */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (!pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  const publicApis = ["/api/auth", "/api/stats", "/api/rewards", "/api/feature-flags", "/api/public", "/api/health"];
  if (publicApis.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    return NextResponse.json(
      { success: false, message: "Unauthorized", code: "UNAUTHORIZED" },
      { status: 401 }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/((?!auth|stats|rewards|feature-flags|public|health).*)"],
};
