import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { token, password, confirmPassword } = body;

  if (!token || !password || !confirmPassword) {
    return NextResponse.json({ success: false, message: "Token, password, and confirmPassword required", code: "VALIDATION_ERROR" }, { status: 400 });
  }

  if (password.length < 8) {
    return NextResponse.json({ success: false, message: "Password must be at least 8 characters", code: "VALIDATION_ERROR" }, { status: 400 });
  }

  if (password !== confirmPassword) {
    return NextResponse.json({ success: false, message: "Passwords do not match", code: "VALIDATION_ERROR" }, { status: 400 });
  }

  const vt = await db.verificationToken.findUnique({ where: { token } });
  if (!vt || vt.type !== "PASSWORD_RESET" || vt.used || vt.expiresAt < new Date()) {
    return NextResponse.json({ success: false, message: "Invalid or expired reset token", code: "INVALID_TOKEN" }, { status: 400 });
  }

  const user = await db.user.findUnique({ where: { email: vt.identifier } });
  if (!user) {
    return NextResponse.json({ success: false, message: "User not found", code: "USER_NOT_FOUND" }, { status: 404 });
  }

  const hashed = await bcrypt.hash(password, 12);

  await db.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: user.id },
      data: { password: hashed, passwordChangedAt: new Date() },
    });
    await tx.verificationToken.update({ where: { id: vt.id }, data: { used: true } });
    await tx.auditLog.create({
      data: { actorId: user.id, action: "PASSWORD_RESET", targetId: user.id },
    });
  });

  return NextResponse.json({ success: true, message: "Password reset successfully. You can now sign in." });
}
