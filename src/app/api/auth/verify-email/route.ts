import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, message: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
  }

  const user = await db.user.findUnique({ where: { id: session.user.id } });
  if (!user) {
    return NextResponse.json({ success: false, message: "User not found", code: "USER_NOT_FOUND" }, { status: 404 });
  }

  if (user.emailVerified) {
    return NextResponse.json({ success: false, message: "Email already verified", code: "ALREADY_VERIFIED" }, { status: 409 });
  }

  const existingToken = await db.verificationToken.findFirst({
    where: { identifier: user.email, type: "EMAIL_VERIFY", used: false, expiresAt: { gt: new Date() } },
  });
  if (existingToken) {
    return NextResponse.json({ success: false, message: "Verification email already sent. Check your inbox.", code: "TOKEN_EXISTS" }, { status: 409 });
  }

  const token = crypto.randomBytes(32).toString("hex");
  await db.verificationToken.create({
    data: {
      identifier: user.email,
      token,
      type: "EMAIL_VERIFY",
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  });

  return NextResponse.json({
    success: true,
    message: "Verification email sent (dev mode).",
    data: { token },
  });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { token } = body;

  if (!token) {
    return NextResponse.json({ success: false, message: "Token required", code: "VALIDATION_ERROR" }, { status: 400 });
  }

  const vt = await db.verificationToken.findUnique({ where: { token } });
  if (!vt || vt.type !== "EMAIL_VERIFY" || vt.used || vt.expiresAt < new Date()) {
    return NextResponse.json({ success: false, message: "Invalid or expired token", code: "INVALID_TOKEN" }, { status: 400 });
  }

  const user = await db.user.findUnique({ where: { email: vt.identifier } });
  if (!user) {
    return NextResponse.json({ success: false, message: "User not found", code: "USER_NOT_FOUND" }, { status: 404 });
  }

  if (user.emailVerified) {
    return NextResponse.json({ success: false, message: "Email already verified", code: "ALREADY_VERIFIED" }, { status: 409 });
  }

  await db.$transaction(async (tx) => {
    await tx.user.update({ where: { id: user.id }, data: { emailVerified: true } });
    await tx.verificationToken.update({ where: { id: vt.id }, data: { used: true } });
    await tx.auditLog.create({ data: { actorId: user.id, action: "EMAIL_VERIFIED", targetId: user.id } });
  });

  return NextResponse.json({ success: true, message: "Email verified successfully" });
}
