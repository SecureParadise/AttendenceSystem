// app/api/complete-profile/teacher/route.ts

import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { UserRole } from "@/app/generated/prisma/client";

export async function POST(req: NextRequest) {
  try {
    // 1) Read body
    const body = await req.json();

    // 2) Extract fields
    const {
      userId,
      firstName,
      middleName,
      lastName,
      cardNo,
      departmentId,
      designation,
      specialization,
      image,
      officeHours,
      roomNumber,
    } = body as {
      userId?: string;
      firstName?: string;
      middleName?: string;
      lastName?: string;
      cardNo?: string;
      departmentId?: string;
      designation?: string;
      specialization?: string;
      image?: string;
      officeHours?: string;
      roomNumber?: string;
    };

    // 3) Check required fields
    if (
      !userId ||
      !firstName ||
      !lastName ||
      !cardNo ||
      !departmentId ||
      !designation
    ) {
      return NextResponse.json(
        { message: "Missing required fields for teacher profile." },
        { status: 400 }
      );
    }

    // 4) Find user and validate role
    const user = await dbConnect.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        role: true,
        isProfileComplete: true,
      },
    });

    if (!user || user.role !== UserRole.TEACHER) {
      return NextResponse.json(
        { message: "User not found or not a teacher." },
        { status: 400 }
      );
    }

    // 5) Avoid duplicate completion
    if (user.isProfileComplete) {
      return NextResponse.json(
        { message: "Profile is already completed." },
        { status: 400 }
      );
    }

    // 6) Check if teacher profile already exists for this user
    const existingTeacherByUser = await dbConnect.teacher.findUnique({
      where: { userId: userId },
    });

    if (existingTeacherByUser) {
      return NextResponse.json(
        { message: "Teacher profile already exists for this user." },
        { status: 400 }
      );
    }

    // 7) Check if card number is already used
    const existingTeacherByCard = await dbConnect.teacher.findUnique({
      where: { cardNo },
    });

    if (existingTeacherByCard) {
      return NextResponse.json(
        { message: "Card number already exists." },
        { status: 409 }
      );
    }

    // 8) Create teacher + update user in transaction
    const [teacher] = await dbConnect.$transaction([
      dbConnect.teacher.create({
        data: {
          userId,
          firstName: firstName.trim(),
          middleName: middleName?.trim() || null,
          lastName: lastName.trim(),
          cardNo: cardNo.trim(),
          departmentId,
          designation: designation.trim(),
          specialization: specialization?.trim() || null,
          image: image || null,
          officeHours: officeHours || null,
          roomNumber: roomNumber || null,
        },
      }),
      dbConnect.user.update({
        where: { id: userId },
        data: {
          isProfileComplete: true,
        },
      }),
    ]);

    // 9) Return success
    return NextResponse.json(
      {
        message: "Teacher profile completed successfully.",
        teacherId: teacher.id,
        redirectTo: "/dashboard/teacher",
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error in /api/complete-profile/teacher:", error);

    // 10) Handle P2002 for unique cardNo
    if (
      error?.code === "P2002" &&
      Array.isArray(error?.meta?.target) &&
      error.meta.target.includes("cardNo")
    ) {
      return NextResponse.json(
        { message: "Card number already exists." },
        { status: 409 }
      );
    }

    // 11) Fallback error
    return NextResponse.json(
      { message: "Something went wrong while completing teacher profile." },
      { status: 500 }
    );
  }
}
