// app/api/resend-verification/route.ts

import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { sendVerificationEmail } from "@/lib/email";

function generateOtp(length = 6) {
  const min = 10 ** (length - 1);
  const max = 10 ** length - 1;
  return Math.floor(Math.random() * (max - min + 1) + min).toString();
}

export async function POST(req: Request) {
  try {
    const { email } = (await req.json()) as { email?: string };

    if (!email) {
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await dbConnect.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Invalid email" },
        { status: 400 }
      );
    }

    const otp = generateOtp(6);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await dbConnect.emailVerificationToken.create({
      data: {
        userId: user.id,
        otp,
        expiresAt,
      },
    });

    await sendVerificationEmail({
      to: user.email,
      otp,
    });

    return NextResponse.json(
      { message: "New verification code sent to your email" },
      { status: 200 }
    );
  } catch (err) {
    console.error("Resend verification error:", err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

