import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, otp } = body as {
      email?: string;
      otp?: string;
    };

    if (!email || !otp) {
      return NextResponse.json(
        { message: "Fields are missing" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const trimmedOtp = otp.trim();

    // 👇 IMPORTANT: await the query
    const user = await dbConnect.user.findUnique({
      where: {
        email: normalizedEmail,
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Invalid email or code" },
        { status: 400 }
      );
    }

    const token = await dbConnect.emailVerificationToken.findFirst({
      where: {
        userId: user.id,        // ✅ now user has .id
        otp: trimmedOtp,
        used: false,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!token) {
      return NextResponse.json(
        { message: "Invalid verification code" },
        { status: 400 }
      );
    }

    if (token.expiresAt < new Date()) {
      return NextResponse.json(
        { message: "Verification code is expired" },
        { status: 400 }
      );
    }

    // Mark email as verified and token as used
    await dbConnect.$transaction([
      dbConnect.user.update({
        where: { id: user.id },    // ✅ user.id works now
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
      { message: "Email verified successfully", redirectTo: "/login" },
      { status: 200 }
    );
  } catch (err: unknown) {
    console.log("Email Verification error", err);
    return NextResponse.json(
      { message: "Internal Server error" },
      { status: 500 }
    );
  }
}
