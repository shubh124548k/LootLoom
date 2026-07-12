import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

async function main() {
  const existing = await db.user.findFirst({ where: { role: "CEO" } });
  if (existing) {
    console.log("CEO account already exists.");
    return;
  }

  const email = process.env.CEO_EMAIL || "ceo@lootloom.app";
  const existingEmail = await db.user.findUnique({ where: { email } });
  if (existingEmail) {
    console.log(`A user with email "${email}" already exists. Use a different CEO_EMAIL.`);
    return;
  }

  const firstName = process.env.CEO_FIRST_NAME || "System";
  const lastName = process.env.CEO_LAST_NAME || "Administrator";
  const username = process.env.CEO_USERNAME || "ceo";
  const password = process.env.CEO_PASSWORD || "Ceo@123456";

  const hashedPassword = await bcrypt.hash(password, 10);

  await db.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email,
        username,
        name: `${firstName} ${lastName}`.trim(),
        password: hashedPassword,
        role: "CEO",
        status: "ACTIVE",
        emailVerified: true,
        passwordChangedAt: new Date(),
      },
    });

    await tx.wallet.create({
      data: {
        userId: user.id,
        coinBalance: 0,
        totalEarned: 0,
        totalSpent: 0,
        status: "ACTIVE",
      },
    });

    await tx.userProfile.create({
      data: {
        userId: user.id,
        firstName,
        lastName,
      },
    });

    await tx.auditLog.create({
      data: {
        actorId: user.id,
        action: "CEO_ACCOUNT_CREATED",
        metadata: JSON.stringify({ email, username }),
      },
    });
  });

  console.log(`CEO account created: ${email}`);
}

main()
  .catch((e) => {
    console.error("Failed to create CEO account:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
