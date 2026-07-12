import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

const REGISTER_LIMIT = new Map<string, { count: number; resetAt: number }>();
const REGISTER_WINDOW = 15 * 60 * 1000;
const MAX_REGISTERS = 3;

function checkRegisterRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = REGISTER_LIMIT.get(ip);
  if (!entry || now > entry.resetAt) {
    REGISTER_LIMIT.set(ip, { count: 1, resetAt: now + REGISTER_WINDOW });
    return true;
  }
  if (entry.count >= MAX_REGISTERS) return false;
  entry.count++;
  return true;
}

const usernameRe = /^[a-zA-Z0-9_]{3,20}$/;
const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
  if (!checkRegisterRateLimit(ip)) {
    return NextResponse.json({ success: false, message: "Too many registration attempts. Try again later.", code: "RATE_LIMITED" }, { status: 429 });
  }

  try {
    const body = await req.json();
    const { firstName, lastName, username, email, password } = body;

    if (!firstName?.trim() || !lastName?.trim() || !email?.trim() || !password || !username?.trim()) {
      return NextResponse.json(
        { success: false, message: "All fields are required", code: "VALIDATION_ERROR" },
        { status: 422 }
      );
    }

    if (!emailRe.test(email)) {
      return NextResponse.json(
        { success: false, message: "Invalid email format", code: "VALIDATION_ERROR" },
        { status: 422 }
      );
    }

    if (!usernameRe.test(username)) {
      return NextResponse.json(
        { success: false, message: "Username must be 3-20 characters (letters, numbers, underscores only)", code: "VALIDATION_ERROR" },
        { status: 422 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { success: false, message: "Password must be at least 8 characters", code: "VALIDATION_ERROR" },
        { status: 422 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const normalizedUsername = username.trim().toLowerCase();

    const [existingEmail, existingUsername] = await Promise.all([
      db.user.findUnique({ where: { email: normalizedEmail } }),
      db.user.findUnique({ where: { username: normalizedUsername } }),
    ]);

    if (existingEmail) {
      return NextResponse.json(
        { success: false, message: "An account with this email already exists", code: "EMAIL_EXISTS" },
        { status: 409 }
      );
    }

    if (existingUsername) {
      return NextResponse.json(
        { success: false, message: "This username is already taken", code: "USERNAME_EXISTS" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const fullName = `${firstName.trim()} ${lastName.trim()}`;

    const user = await db.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email: normalizedEmail,
          username: normalizedUsername,
          password: hashedPassword,
          name: fullName,
          role: "USER",
          status: "ACTIVE",
        },
      });

      await tx.wallet.create({
        data: { userId: newUser.id, coinBalance: 0, totalEarned: 0, totalSpent: 0 },
      });

      await tx.userProfile.create({
        data: { userId: newUser.id, firstName: firstName.trim(), lastName: lastName.trim() },
      });

      await tx.auditLog.create({
        data: { actorId: newUser.id, action: "USER_REGISTERED" },
      });

      return newUser;
    });

    return NextResponse.json({
      success: true,
      data: { id: user.id, email: user.email, name: user.name },
      message: "Account created successfully",
    });
  } catch (err) {
    console.error("Registration error:", err);
    return NextResponse.json(
      { success: false, message: "Registration failed. Please try again.", code: "SERVER_ERROR" },
      { status: 500 }
    );
  }
}
