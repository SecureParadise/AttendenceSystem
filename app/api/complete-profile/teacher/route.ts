import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { UserRole } from "@/app/generated/prisma/enums"; // this import works for you

export async function POST(req: NextRequest) {
  try {
    // 1) Read JSON body
    const body = await req.json();

    // 2) Extract fields actually sent from frontend
    const {
      email,
      cardNo,
      firstName,
      middleName,
      lastName,
      departmentKey, // value from DEPARTMENT_OPTIONS (e.g. "dept_electrical")
      designation,
      specialization,
      image,
      officeHours,
      roomNumber,
    } = body as {
      email?: string;
      cardNo?: string;
      firstName?: string;
      middleName?: string;
      lastName?: string;
      departmentKey?: string;
      designation?: string;
      specialization?: string;
      image?: string;
      officeHours?: string;
      roomNumber?: string;
    };

    // 3) Required field check
    if (!email || !cardNo || !firstName || !lastName || !departmentKey || !designation) {
      return NextResponse.json(
        { message: "Missing required fields for teacher profile." },
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
      where: { userId: user.id },
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

    // 8) Find department by departmentKey (id)
    // you inserted departments with ids: 'dept_electrical', 'dept_civil', ...
    const department = await dbConnect.department.findUnique({
      where: { id: departmentKey },
    });

    if (!department) {
      return NextResponse.json(
        { message: "Invalid department selected." },
        { status: 400 }
      );
    }

    // 9) Create teacher + update user in one transaction
    const [teacher] = await dbConnect.$transaction([
      dbConnect.teacher.create({
        data: {
          userId: user.id,
          cardNo: cardNo.trim(),
          firstName: firstName.trim(),
          middleName: middleName?.trim() || null,
          lastName: lastName.trim(),
          departmentId: department.id,
          designation: designation.trim(),
          specialization: specialization?.trim() || null,
          image: image || null,
          officeHours: officeHours || null,
          roomNumber: roomNumber || null,
        },
      }),
      dbConnect.user.update({
        where: { id: user.id },
        data: {
          isProfileComplete: true,
        },
      }),
    ]);

    // 10) Success response
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

    // Handle unique cardNo
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

    return NextResponse.json(
      { message: "Something went wrong while completing teacher profile." },
      { status: 500 }
    );
  }
}
