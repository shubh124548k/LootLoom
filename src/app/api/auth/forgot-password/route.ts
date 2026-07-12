import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { email } = body;

  if (!email) {
    return NextResponse.json({ success: false, message: "Email required", code: "VALIDATION_ERROR" }, { status: 400 });
  }

  const user = await db.user.findUnique({ where: { email: email.toLowerCase().trim() } });
  if (!user) {
    return NextResponse.json({ success: true, message: "If that email is registered, a reset link has been sent." });
  }

  if (!user.password) {
    return NextResponse.json({ success: false, message: "This account uses Google login. No password reset needed.", code: "GOOGLE_ACCOUNT" }, { status: 400 });
  }

  const existingToken = await db.verificationToken.findFirst({
    where: { identifier: user.email, type: "PASSWORD_RESET", used: false, expiresAt: { gt: new Date() } },
  });
  if (existingToken) {
    return NextResponse.json({ success: false, message: "Reset email already sent. Check your inbox.", code: "TOKEN_EXISTS" }, { status: 409 });
  }

  const token = crypto.randomBytes(32).toString("hex");
  await db.verificationToken.create({
    data: {
      identifier: user.email,
      token,
      type: "PASSWORD_RESET",
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    },
  });

  return NextResponse.json({
    success: true,
    message: "If that email is registered, a reset link has been sent.",
    data: { token },
  });
}
