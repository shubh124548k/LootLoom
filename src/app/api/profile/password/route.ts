import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

const RATE_LIMIT_WINDOW = 15 * 60 * 1000;
const MAX_CHANGES = 3;
const passwordChangeLimits = new Map<string, { count: number; resetAt: number }>();

function checkPasswordRateLimit(userId: string): boolean {
  const now = Date.now();
  const entry = passwordChangeLimits.get(userId);
  if (!entry || now > entry.resetAt) {
    passwordChangeLimits.set(userId, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return true;
  }
  if (entry.count >= MAX_CHANGES) return false;
  entry.count++;
  return true;
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, message: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
  }

  if (!checkPasswordRateLimit(session.user.id)) {
    return NextResponse.json({ success: false, message: "Too many password change attempts. Try again later.", code: "RATE_LIMITED" }, { status: 429 });
  }

  const body = await req.json();
  const { currentPassword, newPassword, confirmPassword } = body;

  if (!currentPassword || !newPassword || !confirmPassword) {
    return NextResponse.json({ success: false, message: "All password fields are required", code: "VALIDATION_ERROR" }, { status: 400 });
  }

  if (newPassword.length < 8) {
    return NextResponse.json({ success: false, message: "New password must be at least 8 characters", code: "VALIDATION_ERROR" }, { status: 400 });
  }

  if (newPassword !== confirmPassword) {
    return NextResponse.json({ success: false, message: "New passwords do not match", code: "VALIDATION_ERROR" }, { status: 400 });
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) {
    return NextResponse.json({ success: false, message: "User not found", code: "USER_NOT_FOUND" }, { status: 404 });
  }

  if (!user.password) {
    return NextResponse.json({ success: false, message: "No password set. You may have signed up via Google.", code: "NO_PASSWORD" }, { status: 400 });
  }

  const valid = await bcrypt.compare(currentPassword, user.password);
  if (!valid) {
    return NextResponse.json({ success: false, message: "Current password is incorrect", code: "INVALID_PASSWORD" }, { status: 403 });
  }

  const sameAsOld = await bcrypt.compare(newPassword, user.password);
  if (sameAsOld) {
    return NextResponse.json({ success: false, message: "New password must be different from current password", code: "SAME_PASSWORD" }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12);

  await db.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: session.user.id },
      data: {
        password: hashedPassword,
        passwordChangedAt: new Date(),
      },
    });

    await tx.auditLog.create({
      data: {
        actorId: session.user.id,
        action: "PASSWORD_CHANGED",
      },
    });
  });

  return NextResponse.json({
    success: true,
    message: "Password changed successfully. All other sessions have been logged out.",
  });
}
