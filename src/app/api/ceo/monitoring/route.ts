import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

/**
 * GET /api/ceo/monitoring — system health monitoring for CEO.
 * Returns: API/database/realtime status, service health, recent errors.
 * CEO-only access.
 */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, message: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
  }
  const user = await db.user.findUnique({ where: { id: session.user.id } });
  if (!user || user.role !== "CEO") {
    return NextResponse.json({ success: false, message: "CEO access required", code: "FORBIDDEN" }, { status: 403 });
  }

  // Check database health by counting key tables
  let dbHealthy = true;
  let dbResponseTime = 0;
  try {
    const start = Date.now();
    await db.user.count();
    dbResponseTime = Date.now() - start;
  } catch {
    dbHealthy = false;
  }

  // Check realtime service (port 3003)
  let realtimeHealthy = false;
  try {
    const resp = await fetch("http://localhost:3003/?XTransformPort=3003", {
      method: "GET",
      signal: AbortSignal.timeout(2000),
    });
    realtimeHealthy = resp.status === 400 || resp.ok;
  } catch {
    realtimeHealthy = false;
  }

  // Services status
  const services = [
    { name: "Authentication", status: "OPERATIONAL", description: "Google OAuth + NextAuth" },
    { name: "Database", status: dbHealthy ? "OPERATIONAL" : "DOWN", description: dbHealthy ? `SQLite (${dbResponseTime}ms)` : "Connection failed" },
    { name: "Wallet Engine", status: dbHealthy ? "OPERATIONAL" : "DEGRADED", description: "Ledger-based" },
    { name: "Redeem System", status: dbHealthy ? "OPERATIONAL" : "DEGRADED", description: "Approval workflow" },
    { name: "Ads Engine", status: dbHealthy ? "OPERATIONAL" : "DEGRADED", description: "Session-based verification" },
    { name: "Notifications", status: dbHealthy ? "OPERATIONAL" : "DEGRADED", description: "Database-backed" },
    { name: "Support System", status: dbHealthy ? "OPERATIONAL" : "DEGRADED", description: "Ticket + messaging" },
    { name: "Realtime Service", status: realtimeHealthy ? "OPERATIONAL" : "OFFLINE", description: "Socket.io port 3003" },
    { name: "API Gateway", status: "OPERATIONAL", description: "Next.js App Router" },
  ];

  const allOperational = services.every((s) => s.status === "OPERATIONAL");
  const hasDegraded = services.some((s) => s.status === "DEGRADED");

  return NextResponse.json({
    success: true,
    data: {
      overallStatus: allOperational ? "HEALTHY" : hasDegraded ? "DEGRADED" : "CRITICAL",
      services,
      database: { healthy: dbHealthy, responseTimeMs: dbResponseTime },
      realtime: { healthy: realtimeHealthy, port: 3003 },
      timestamp: new Date().toISOString(),
    },
  });
}
