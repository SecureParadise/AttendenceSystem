import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, otp } = body as { email?: string; otp?: string };

    if (!email || !otp) {
      return NextResponse.json(
        { message: "Email and OTP are required" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // 1) Find user
    const user = await dbConnect.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Invalid email or code" },
        { status: 400 }
      );
    }

    // 2) Find latest matching OTP, not used
    const token = await dbConnect.emailVerificationToken.findFirst({
      where: {
        userId: user.id,
        otp,
        used: false,
      },
      orderBy: { createdAt: "desc" },
    });

    if (!token) {
      return NextResponse.json(
        { message: "Invalid verification code" },
        { status: 400 }
      );
    }

    // 3) Check expiry
    if (token.expiresAt < new Date()) {
      return NextResponse.json(
        { message: "Verification code has expired" },
        { status: 400 }
      );
    }

    // 4) Mark user verified + token used
    await dbConnect.$transaction([
      dbConnect.user.update({
        where: { id: user.id },
        data: {
          isEmailVerified: true,
        },
      }),
      dbConnect.emailVerificationToken.update({
        where: { id: token.id },
        data: { used: true },
      }),
    ]);

    return NextResponse.json(
      {
        message: "Email verified successfully",
        redirectTo: "/login", // later you can change to /complete-profile
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Verify email error:", err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
