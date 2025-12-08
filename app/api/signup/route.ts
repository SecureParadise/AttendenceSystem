// app/api/signup/route.ts

import { NextResponse } from "next/server";
import { Prisma, UserRole } from "@/app/generated/prisma/client";
import dbConnect from "@/lib/dbConnect";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, phone, password, role } = body as {
      email?: string;
      phone?: string;
      password?: string;
      role?: "student" | "teacher";
    };

    // 1) Basic required fields check
    if (!email || !phone || !password || !role) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPhone = phone.trim();

    // 2) Check if user with this email already exists
    const existingUser = await dbConnect.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      // Email exists but NOT verified -> go to verify-email page
      if (!existingUser.isEmailVerified) {
        return NextResponse.json(
          {
            message: "Email already registered but not verified",
            redirectTo: "/email-verify", // Email is set on DB now we have to verify it
          },
          { status: 200 }
        );
      }

      // Email exists AND verified -> do not allow signup again
      return NextResponse.json(
        {
          message: "Cannot create account with this email.",
        },
        { status: 409 }
      );
    }

    // 3) Check if phone already used
    const existingByPhone = await dbConnect.user.findUnique({
      where: { phone: normalizedPhone },
    });

    if (existingByPhone) {
      return NextResponse.json(
        { message: "Phone number already registered" },
        { status: 409 }
      );
    }

    // 4) Map role string -> enum
    let mappedRole: UserRole | null = null;
    if (role === "student") mappedRole = UserRole.STUDENT;
    if (role === "teacher") mappedRole = UserRole.TEACHER;

    if (!mappedRole) {
      return NextResponse.json({ message: "Invalid role" }, { status: 400 });
    }

    // 5) Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // 6) Create user (email not verified yet)
    const user = await dbConnect.user.create({
      data: {
        email: normalizedEmail,
        phone: normalizedPhone,
        passwordHash,
        role: mappedRole,
      },
      select: {
        id: true,
        email: true,
        phone: true,
        role: true,
        isEmailVerified: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        message: "Account created successfully. Please verify your email.",
        redirectTo: "/email-verify", // 👈 same page
        user,
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2002") {
        const target = Array.isArray(err.meta?.target)
          ? err.meta.target.join(", ")
          : "field";

        return NextResponse.json(
          { message: `A user with this ${target} already exists` },
          { status: 409 }
        );
      }
    }

    console.error("Signup error:", err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
