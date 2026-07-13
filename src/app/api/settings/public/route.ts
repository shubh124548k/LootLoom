import { NextResponse } from "next/server";
import { getSupportEmail } from "@/lib/settings";

export async function GET() {
  const supportEmail = getSupportEmail();

  return NextResponse.json({
    success: true,
    data: {
      supportEmail: supportEmail || "",
    },
  });
}
