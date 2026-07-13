import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDailyAdStatus } from "@/lib/ads/daily-limiter";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
    }

    const status = await getDailyAdStatus(session.user.id);

    return NextResponse.json({ success: true, data: status });
  } catch (error) {
    console.error("[ADS_STATUS]", error);
    return NextResponse.json({ success: false, message: "Failed to load ad status" }, { status: 500 });
  }
}
