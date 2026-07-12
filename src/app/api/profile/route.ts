import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

const RATE_LIMIT_WINDOW = 60 * 1000;
const MAX_UPDATES = 10;
const profileUpdateLimits = new Map<string, { count: number; resetAt: number }>();

function checkUpdateRateLimit(userId: string): boolean {
  const now = Date.now();
  const entry = profileUpdateLimits.get(userId);
  if (!entry || now > entry.resetAt) {
    profileUpdateLimits.set(userId, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return true;
  }
  if (entry.count >= MAX_UPDATES) return false;
  entry.count++;
  return true;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, message: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: {
      profile: true,
      wallet: true,
      referralCode: true,
    },
  });

  if (!user) {
    return NextResponse.json({ success: false, message: "User not found", code: "USER_NOT_FOUND" }, { status: 404 });
  }

  const totalRedeems = await db.redeemRequest.count({
    where: { userId: user.id },
  });

  return NextResponse.json({
    success: true,
    data: {
      id: user.id,
      email: user.email,
      username: user.username,
      name: user.name,
      avatar: user.avatar,
      role: user.role,
      status: user.status,
      emailVerified: user.emailVerified,
      memberSince: user.createdAt,
      lastLogin: user.lastLoginAt,
      passwordChangedAt: user.passwordChangedAt,
      profile: user.profile
        ? {
            firstName: user.profile.firstName,
            lastName: user.profile.lastName,
          }
        : null,
      wallet: user.wallet
        ? {
            coinBalance: user.wallet.coinBalance,
            totalEarned: user.wallet.totalEarned,
            totalSpent: user.wallet.totalSpent,
          }
        : null,
      referralCode: user.referralCode?.code ?? null,
      totalRedeems,
    },
  });
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, message: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
  }

  if (!checkUpdateRateLimit(session.user.id)) {
    return NextResponse.json({ success: false, message: "Too many profile updates. Try again later.", code: "RATE_LIMITED" }, { status: 429 });
  }

  const body = await req.json();
  const { firstName, lastName, username } = body;

  if (firstName !== undefined && (typeof firstName !== "string" || !firstName.trim())) {
    return NextResponse.json({ success: false, message: "First name cannot be empty", code: "VALIDATION_ERROR" }, { status: 400 });
  }
  if (lastName !== undefined && (typeof lastName !== "string" || !lastName.trim())) {
    return NextResponse.json({ success: false, message: "Last name cannot be empty", code: "VALIDATION_ERROR" }, { status: 400 });
  }
  if (firstName && firstName.trim().length > 50) {
    return NextResponse.json({ success: false, message: "First name must be 50 characters or fewer", code: "VALIDATION_ERROR" }, { status: 400 });
  }
  if (lastName && lastName.trim().length > 50) {
    return NextResponse.json({ success: false, message: "Last name must be 50 characters or fewer", code: "VALIDATION_ERROR" }, { status: 400 });
  }

  const updates: Record<string, unknown> = {};
  let usernameChanged = false;

  if (firstName !== undefined) {
    updates.firstName = firstName.trim();
  }
  if (lastName !== undefined) {
    updates.lastName = lastName.trim();
  }

  if (username !== undefined) {
    if (typeof username !== "string" || !username.trim()) {
      return NextResponse.json({ success: false, message: "Username cannot be empty", code: "VALIDATION_ERROR" }, { status: 400 });
    }
    const trimmed = username.trim().toLowerCase();
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(trimmed)) {
      return NextResponse.json({ success: false, message: "Username must be 3–20 characters (letters, numbers, underscores only)", code: "VALIDATION_ERROR" }, { status: 400 });
    }

    const existing = await db.user.findUnique({ where: { username: trimmed } });
    if (existing && existing.id !== session.user.id) {
      return NextResponse.json({ success: false, message: "Username is already taken", code: "DUPLICATE_USERNAME" }, { status: 409 });
    }

    updates.username = trimmed;
    usernameChanged = true;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ success: false, message: "No fields to update", code: "VALIDATION_ERROR" }, { status: 400 });
  }

  const result = await db.$transaction(async (tx) => {
    const profileData: Record<string, string> = {};
    if (updates.firstName) profileData.firstName = updates.firstName as string;
    if (updates.lastName) profileData.lastName = updates.lastName as string;

    if (Object.keys(profileData).length > 0) {
      await tx.userProfile.upsert({
        where: { userId: session.user.id },
        create: { userId: session.user.id, ...profileData },
        update: profileData,
      });
    }

    const userData: Record<string, unknown> = {};
    if (updates.username) userData.username = updates.username;
    if (firstName !== undefined || lastName !== undefined) {
      const currentUser = await tx.user.findUnique({ where: { id: session.user.id }, include: { profile: true } });
      const fName = (updates.firstName as string) ?? currentUser?.profile?.firstName ?? "";
      const lName = (updates.lastName as string) ?? currentUser?.profile?.lastName ?? "";
      userData.name = `${fName} ${lName}`.trim();
    }

    if (Object.keys(userData).length > 0) {
      await tx.user.update({ where: { id: session.user.id }, data: userData });
    }

    const auditActions: string[] = [];
    if (Object.keys(profileData).length > 0) auditActions.push("PROFILE_UPDATED");
    if (usernameChanged) auditActions.push("USERNAME_CHANGED");

    for (const action of auditActions) {
      await tx.auditLog.create({
        data: {
          actorId: session.user.id,
          action,
          metadata: JSON.stringify(updates),
        },
      });
    }

    return { profileUpdates: Object.keys(profileData).length > 0, usernameChanged };
  });

  return NextResponse.json({
    success: true,
    message: "Profile updated successfully",
    data: result,
  });
}
