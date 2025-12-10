// app/api/complete-profile/student/route.ts

import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { UserRole } from "@/app/generated/prisma/client";

export async function POST(req: NextRequest) {
  try {
    // 1) Read JSON body from request
    const body = await req.json();

    // 2) Extract expected fields
    const {
      userId,
      firstName,
      middleName,
      lastName,
      rollNo,
      branchId,
      currentSemesterId,
      academicYear,
      batch,
      image,
    } = body as {
      userId?: string;
      firstName?: string;
      middleName?: string;
      lastName?: string;
      rollNo?: string;
      branchId?: string;
      currentSemesterId?: string;
      academicYear?: string;
      batch?: string;
      image?: string;
    };

    // 3) Check required fields
    if (
      !userId ||
      !firstName ||
      !lastName ||
      !rollNo ||
      !branchId
    ) {
      return NextResponse.json(
        { message: "Missing required fields for student profile." },
        { status: 400 }
      );
    }

    // 4) Find the user from database
    const user = await dbConnect.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        role: true,
        isProfileComplete: true,
      },
    });

    // 5) If no user or wrong role, reject
    if (!user || user.role !== UserRole.STUDENT) {
      return NextResponse.json(
        { message: "User not found or not a student." },
        { status: 400 }
      );
    }

    // 6) If profile already complete, avoid duplicate creation
    if (user.isProfileComplete) {
      return NextResponse.json(
        { message: "Profile is already completed." },
        { status: 400 }
      );
    }

    // 7) Check if a student profile already exists for this user
    const existingStudentByUser = await dbConnect.student.findUnique({
      where: { userId: userId },
    });

    if (existingStudentByUser) {
      return NextResponse.json(
        { message: "Student profile already exists for this user." },
        { status: 400 }
      );
    }

    // 8) Check if roll number is already used
    const existingStudentByRoll = await dbConnect.student.findUnique({
      where: { rollNo },
    });

    if (existingStudentByRoll) {
      return NextResponse.json(
        { message: "Roll number already exists." },
        { status: 409 }
      );
    }

    // 9) Create student profile + update user in a transaction
    const [student] = await dbConnect.$transaction([
      dbConnect.student.create({
        data: {
          userId,
          firstName: firstName.trim(),
          middleName: middleName?.trim() || null,
          lastName: lastName.trim(),
          rollNo: rollNo.trim(),
          branchId,
          currentSemesterId: currentSemesterId || null,
          academicYear: academicYear || null,
          batch: batch || null,
          image: image || null,
        },
      }),
      dbConnect.user.update({
        where: { id: userId },
        data: {
          isProfileComplete: true,
        },
      }),
    ]);

    // 10) Return success and maybe where to go next
    return NextResponse.json(
      {
        message: "Student profile completed successfully.",
        studentId: student.id,
        redirectTo: "/dashboard/student",
      },
      { status: 201 }
    );
  } catch (error: any) {
    // 11) Handle Prisma unique errors if needed
    console.error("Error in /api/complete-profile/student:", error);

    // 12) Basic error handling for P2002 (unique constraint)
    if (
      error?.code === "P2002" &&
      Array.isArray(error?.meta?.target) &&
      error.meta.target.includes("rollNo")
    ) {
      return NextResponse.json(
        { message: "Roll number already exists." },
        { status: 409 }
      );
    }

    // 13) Fallback error response
    return NextResponse.json(
      { message: "Something went wrong while completing student profile." },
      { status: 500 }
    );
  }
}
