// app/api/login/route.ts

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/dbConnect";
import { UserRole } from "@/app/generated/prisma/client";

// This function runs when the client sends a POST request to /api/login
export async function POST(req: NextRequest) {
  try {
    // 1) Read JSON body from the request
    const body = await req.json();

    // 2) Take out these fields from the body
    const { email, password, rememberMe } = body as {
      email?: string;
      password?: string;
      rememberMe?: boolean;
    };

    // 3) Make sure email and password are provided
    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required." },
        { status: 400 }
      );
    }

    // 4) Clean the email (remove spaces, make lowercase)
    const normalizedEmail = email.trim().toLowerCase();

    // 5) Find user in database by email
    const user = await dbConnect.user.findUnique({
      where: { email: normalizedEmail },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        role: true,
        isEmailVerified: true,
        isProfileComplete: true,
        createdAt: true,
      },
    });

    // 6) If no user found, return "invalid email or password"
    if (!user) {
      return NextResponse.json(
        { message: "Invalid email or password." },
        { status: 401 }
      );
    }

    // 7) If email is not verified, send them to email-verify page
    if (!user.isEmailVerified) {
      return NextResponse.json(
        {
          message: "Please verify your email before logging in.",
          redirectTo: `/email-verify?email=${encodeURIComponent(user.email)}`,
        },
        { status: 403 }
      );
    }

    // 8) Compare the plain password with saved hash
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    // 9) If password does not match, return error
    if (!isPasswordValid) {
      return NextResponse.json(
        { message: "Invalid email or password." },
        { status: 401 }
      );
    }

    // 10) Decide where to redirect after successful login
    let redirectTo = "/";

    // 11) If profile is not complete, send to complete-profile first
    if (!user.isProfileComplete) {
      let roleParam: "student" | "teacher" | null = null;
      if (user.role === UserRole.STUDENT) {
        roleParam = "student";
      } else if (user.role === UserRole.TEACHER) {
        roleParam = "teacher";
      }
      const searchParams = new URLSearchParams();
      if(roleParam){
        searchParams.set("role",roleParam)
      }
      searchParams.set("email",user.email);
      redirectTo = `/complete-profile?${searchParams.toString()}`;
    } else {
      // 12) If profile is complete, send based on user role
      switch (user.role) {
        case UserRole.STUDENT:
          redirectTo = "/dashboard/student"; // later: maybe /dashboard/student/[rollNo]
          break;
        case UserRole.TEACHER:
          redirectTo = "/dashboard/teacher";
          break;
        case UserRole.ADMIN:
          redirectTo = "/dashboard/admin";
          break;
        case UserRole.HOD:
          redirectTo = "/dashboard/hod";
          break;
        default:
          redirectTo = "/dashboard";
      }
    }

    // 13) Create response JSON
    const response = NextResponse.json(
      {
        message: "Login successful.",
        redirectTo,
      },
      { status: 200 }
    );

    // 14) TODO: Here you will set a real auth cookie / session
    // Example (pseudo):
    // const token = createJwtToken({ userId: user.id, role: user.role });
    // response.cookies.set("auth_token", token, {
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === "production",
    //   maxAge: rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 2, // 30 days vs 2 hours
    //   path: "/",
    // });

    // 15) Return response back to client
    return response;
  } catch (error) {
    // 16) Log error on server and send generic message
    console.error("Error in /api/login:", error);
    return NextResponse.json(
      { message: "Something went wrong while logging in." },
      { status: 500 }
    );
  }
}
