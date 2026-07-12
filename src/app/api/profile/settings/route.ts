import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, message: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
  }

  return NextResponse.json({
    success: true,
    data: {
      showOnLeaderboard: true,
      receiveNotifications: true,
      allowPersonalization: false,
      showEarningsPublicly: false,
    },
  });
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, message: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
  }

  const body = await req.json();
  const boolFields = ["showOnLeaderboard", "receiveNotifications", "allowPersonalization", "showEarningsPublicly"] as const;

  for (const field of boolFields) {
    if (field in body && typeof body[field] !== "boolean") {
      return NextResponse.json({ success: false, message: `${field} must be a boolean`, code: "VALIDATION_ERROR" }, { status: 400 });
    }
  }

  return NextResponse.json({
    success: true,
    data: body,
    message: "Settings updated",
  });
}
