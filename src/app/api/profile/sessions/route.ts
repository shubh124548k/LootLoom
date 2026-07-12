import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, message: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { lastLoginAt: true, passwordChangedAt: true },
  });

  if (!user) {
    return NextResponse.json({ success: false, message: "User not found", code: "USER_NOT_FOUND" }, { status: 404 });
  }

  const tokenIat = session.user.iat ?? null;
  const tokenExp = session.user.exp ?? null;

  return NextResponse.json({
    success: true,
    data: {
      currentSession: {
        loggedInAt: tokenIat ? new Date(tokenIat * 1000).toISOString() : null,
        expiresAt: tokenExp ? new Date(tokenExp * 1000).toISOString() : null,
        lastLogin: user.lastLoginAt,
      },
      passwordChangedAt: user.passwordChangedAt,
    },
  });
}

export async function DELETE() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, message: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
  }

  await db.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: session.user.id },
      data: { passwordChangedAt: new Date() },
    });

    await tx.auditLog.create({
      data: {
        actorId: session.user.id,
        action: "LOGOUT_ALL_DEVICES",
      },
    });
  });

  return NextResponse.json({
    success: true,
    message: "Signed out of all devices. Please sign in again.",
  });
}
