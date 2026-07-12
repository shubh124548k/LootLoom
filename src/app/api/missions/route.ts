import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { atomicCoinCredit } from "@/lib/earn/credit";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, message: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
  }

  const missions = await db.mission.findMany({
    where: { status: "ACTIVE" },
    orderBy: { createdAt: "asc" },
  });

  const userMissions = await db.userMission.findMany({
    where: { userId: session.user.id },
    include: { mission: true },
  });

  const userMissionMap = new Map(userMissions.map((um) => [um.missionId, um]));

  const data = missions.map((mission) => {
    const progress = userMissionMap.get(mission.id);
    return {
      id: mission.id,
      key: mission.key,
      name: mission.name,
      description: mission.description,
      rewardCoins: mission.rewardCoins,
      requirement: mission.requirement,
      cooldownHours: mission.cooldownHours,
      progress: progress?.progress ?? 0,
      completed: progress?.completed ?? false,
      claimedAt: progress?.claimedAt ?? null,
    };
  });

  return NextResponse.json({ success: true, data });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, message: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
  }

  const body = await req.json();
  const { missionId } = body;
  if (!missionId) {
    return NextResponse.json({ success: false, message: "missionId required", code: "VALIDATION_ERROR" }, { status: 400 });
  }

  const mission = await db.mission.findUnique({ where: { id: missionId } });
  if (!mission || mission.status !== "ACTIVE") {
    return NextResponse.json({ success: false, message: "Mission not found or inactive", code: "MISSION_NOT_FOUND" }, { status: 404 });
  }

  let result;
  try {
    result = await db.$transaction(async (tx) => {
      const userMission = await tx.userMission.findUnique({
        where: { userId_missionId: { userId: session.user.id, missionId } },
      });

      if (!userMission || !userMission.completed) {
        throw new Error("MISSION_NOT_COMPLETED");
      }

      if (userMission.claimedAt) {
        throw new Error("ALREADY_CLAIMED");
      }

      const currentWallet = await tx.wallet.findUnique({ where: { userId: session.user.id } });
      if (!currentWallet) throw new Error("WALLET_NOT_FOUND");

      await tx.userMission.update({
        where: { id: userMission.id },
        data: { claimedAt: new Date() },
      });

      await tx.missionLog.create({
        data: {
          userId: session.user.id,
          missionId,
          reward: mission.rewardCoins,
        },
      });

      const credit = await atomicCoinCredit(tx, {
        userId: session.user.id,
        walletId: currentWallet.id,
        amount: mission.rewardCoins,
        type: "MISSION_REWARD",
        referenceId: missionId,
        description: `Mission completed: ${mission.name}`,
      });

      return credit;
    });
  } catch (txError) {
    const message = txError instanceof Error ? txError.message : "UNKNOWN";
    if (message === "MISSION_NOT_COMPLETED") {
      return NextResponse.json({ success: false, message: "Mission not yet completed", code: "MISSION_NOT_COMPLETED" }, { status: 400 });
    }
    if (message === "ALREADY_CLAIMED") {
      return NextResponse.json({ success: false, message: "Mission already claimed", code: "ALREADY_CLAIMED" }, { status: 409 });
    }
    if (message === "WALLET_NOT_FOUND") {
      return NextResponse.json({ success: false, message: "Wallet not found", code: "WALLET_NOT_FOUND" }, { status: 404 });
    }
    throw txError;
  }

  return NextResponse.json({
    success: true,
    data: result,
    message: `Claimed ${mission.rewardCoins} coins for completing "${mission.name}"`,
  });
}
