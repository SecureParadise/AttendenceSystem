// app/api/login/route.ts
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import bcrypt from "bcryptjs";
// If you want Prisma error codes:
// import { Prisma } from "@/app/generated/prisma/client";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { email, password, rememberMe } = body as {
      email?: string;
      password?: string;
      rememberMe?: boolean;
    };

    // 1) Basic validation
    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // 2) Find user by email
    const user = await dbConnect.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      // Do NOT reveal whether email exists (security)
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 }
      );
    }

    // 3) Check if email is verified
    if (!user.isEmailVerified) {
      return NextResponse.json(
        {
          message:
            "Your email is not verified. Please verify your email before logging in.",
          redirectTo: `/email-verify?email=${encodeURIComponent(
            normalizedEmail
          )}`,
        },
        { status: 403 }
      );
    }

    // 4) Check account active
    if (!user.isActive) {
      return NextResponse.json(
        {
          message:
            "Your account is deactivated. Please contact campus admin/support.",
        },
        { status: 403 }
      );
    }

    // 5) Compare password using bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 }
      );
    }

    // 6) Optional: update lastLogin
    await dbConnect.user.update({
      where: { id: user.id },
      data: {
        lastLogin: new Date(),
      },
    });

    // 7) Decide redirect based on profile completeness
    let redirectTo = "/dashboard";

    // If you added isProfileComplete flag on User:
    if (!user.isProfileComplete) {
      redirectTo = "/complete-profile"; // you will create this page later
    }

    // In real app you would also set a session / JWT cookie here.
    // For now we just return success message and redirect URL.
    return NextResponse.json(
      {
        message: "Login successful",
        redirectTo,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
