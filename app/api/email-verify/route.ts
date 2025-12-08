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
    const normalizedEmail = email.trim().toLocaleLowerCase();

    const user = dbConnect.user.findUnique({
      where: {
        email: normalizedEmail,
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Inavlid email or code" },
        { status: 400 }
      );
    }

    const token = await dbConnect.emailVerificationToken.findFirst({
      where: {
        userId: user.id,
        otp,
        used: false,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!token) {
      return NextResponse.json(
        { mesage: "Invalid verification code" },
        { status: 400 }
      );
    }

    if (token.expiresAt < new Date()) {
      return NextResponse.json(
        { message: "Verification code is expired" },
        { status: 400 }
      );
    }
    // In db convert isEmailVerified = true, and token_used=true
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
      { message: "Email verified successfully", redirectTo: "/login" },
      {
        status: 200,
      }
    );
  } catch (err: unknown) {
    console.log("Email Verification error", err);
    return NextResponse.json(
      {
        message: "Internal Server error",
      },
      { status: 500 }
    );
  }
}
