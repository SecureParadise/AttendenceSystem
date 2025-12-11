// app/api/complete-profile/student/route.ts
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { UserRole } from "@/app/generated/prisma/client";

export async function POST(req: NextRequest) {
  try {
    // 1) Read JSON body
    const body = await req.json();

    // 2) Take what we really send from frontend
    const {
      email,
      rollNo,
      firstName,
      middleName,
      lastName,
      branchCode,
      currentSemesterNumber,
      batch,
    } = body as {
      email?: string;
      rollNo?: string;
      firstName?: string;
      middleName?: string;
      lastName?: string;
      branchCode?: string;
      currentSemesterNumber?: string;
      batch?: string;
    };

    // 3) Basic required checks
    if (
      !email ||
      !rollNo ||
      !firstName ||
      !lastName ||
      !branchCode ||
      !currentSemesterNumber ||
      !batch
    ) {
      return NextResponse.json(
        { message: "Missing required fields for student profile." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // 4) Find user by email
    const user = await dbConnect.user.findUnique({
      where: { email: normalizedEmail },
      select: {
        id: true,
        role: true,
        isProfileComplete: true,
      },
    });

    // 5) Validate user + role
    if (!user || user.role !== UserRole.STUDENT) {
      return NextResponse.json(
        { message: "User not found or not a student." },
        { status: 400 }
      );
    }

    // 6) Prevent duplicate completion
    if (user.isProfileComplete) {
      return NextResponse.json(
        { message: "Profile is already completed." },
        { status: 400 }
      );
    }

    // 7) Check if a student profile already exists for this user
    const existingStudentByUser = await dbConnect.student.findUnique({
      where: { userId: user.id },
    });

    if (existingStudentByUser) {
      return NextResponse.json(
        { message: "Student profile already exists for this user." },
        { status: 400 }
      );
    }

    // 8) Check if roll number is already used
    const existingStudentByRoll = await dbConnect.student.findUnique({
      where: { rollNo: rollNo.trim() },
    });

    if (existingStudentByRoll) {
      return NextResponse.json(
        { message: "Roll number already exists." },
        { status: 409 }
      );
    }

    // 9) Find Branch from branchCode (BCE, BEI, ...)
    const branch = await dbConnect.branch.findUnique({
      where: { code: branchCode },
    });

    if (!branch) {
      return NextResponse.json(
        { message: "Invalid branch selected." },
        { status: 400 }
      );
    }

    // 10) Find Semester from (branchId, number)
    const semesterNumber = parseInt(currentSemesterNumber, 10);

    const semester = await dbConnect.semester.findUnique({
      where: {
        // uses @@unique([branchId, number]) in your schema
        branchId_number: {
          branchId: branch.id,
          number: semesterNumber,
        },
      },
    });

    if (!semester) {
      return NextResponse.json(
        { message: "Invalid semester selected for this branch." },
        { status: 400 }
      );
    }

    // 11) Create student + mark user profile complete (transaction)
    const [student] = await dbConnect.$transaction([
      dbConnect.student.create({
        data: {
          userId: user.id,
          firstName: firstName.trim(),
          middleName: middleName?.trim() || null,
          lastName: lastName.trim(),
          rollNo: rollNo.trim(),
          branchId: branch.id,
          currentSemesterId: semester.id,
          academicYear: `${batch} Batch`,
          batch: `${batch} Batch`,
        },
      }),
      dbConnect.user.update({
        where: { id: user.id },
        data: {
          isProfileComplete: true,
        },
      }),
    ]);

    // 12) Success response
    return NextResponse.json(
      {
        message: "Student profile completed successfully.",
        studentId: student.id,
        redirectTo: "/dashboard/student",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in /api/complete-profile/student:", error);
    return NextResponse.json(
      {
        message: "Something went wrong while completing student profile.",
      },
      { status: 500 }
    );
  }
}
