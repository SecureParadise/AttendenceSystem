// prisma/seed.ts
import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  // 1) Department
  const department = await prisma.department.upsert({
    where: { name: "Electronics & Computer" },
    update: {},
    create: { name: "Electronics & Computer" },
  });

  // 2) Branch (ECIE) — code chosen to match many of your seeds
  const branch = await prisma.branch.upsert({
    where: { code: "ECIE" },
    update: {
      name: "Electronics Communication & Information Engineering",
      departmentId: department.id,
    },
    create: {
      name: "Electronics Communication & Information Engineering",
      code: "ECIE",
      departmentId: department.id,
    },
  });

  // 3) Semester 5 (5th Semester) for this branch
  const semester = await prisma.semester.upsert({
    where: { branchId_number: { branchId: branch.id, number: 5 } },
    update: { name: "5th Semester" },
    create: {
      branchId: branch.id,
      number: 5,
      name: "5th Semester",
    },
  });

  // 4) Teacher user (upsert by email) + Teacher (upsert by cardNo)
  const teacherUser = await prisma.user.upsert({
    where: { email: "bp@example.test" },
    update: { role: "TEACHER" },
    create: {
      email: "bp@example.test",
      phone: "9800000002",
      passwordHash: "teacherSeedPass", // dev-only placeholder
      role: "TEACHER",
      isEmailVerified: true,
    },
  });

  const teacher = await prisma.teacher.upsert({
    where: { cardNo: "t_BP_001" },
    update: {
      firstName: "BP",
      lastName: "Teacher",
      departmentId: department.id,
      image: "placeholder.jpg",
    },
    create: {
      userId: teacherUser.id,
      cardNo: "t_BP_001",
      firstName: "BP",
      lastName: "Teacher",
      designation: "Lecturer",
      departmentId: department.id,
      image: "placeholder.jpg",
    },
  });

  // 5) Subject: Operating Systems (OS)
  const subject = await prisma.subject.upsert({
    where: { code: "OS" },
    update: {
      name: "Operating Systems",
      semesterId: semester.id,
      branchId: branch.id,
      teacherId: teacher.id,
      isLab: false,
      credits: 3,
    },
    create: {
      code: "OS",
      name: "Operating Systems",
      semesterId: semester.id,
      branchId: branch.id,
      teacherId: teacher.id,
      isLab: false,
      credits: 3,
    },
  });

  // 6) Student user + Student (Mukesh) — using the rollNo on your UI
  const studentUser = await prisma.user.upsert({
    where: { email: "pas078bei023@student.test" },
    update: { role: "STUDENT" },
    create: {
      email: "pas078bei023@student.test",
      phone: "9800000003",
      passwordHash: "studentSeedPass",
      role: "STUDENT",
      isEmailVerified: true,
    },
  });

  const student = await prisma.student.upsert({
    where: { rollNo: "PAS078BEI023" },
    update: {
      firstName: "Mukesh",
      middleName: "Amaresh",
      lastName: "Thakur",
      branchId: branch.id,
      currentSemesterId: semester.id,
      userId: studentUser.id,
      image: "mukesh.jpg",
    },
    create: {
      userId: studentUser.id,
      rollNo: "PAS078BEI023",
      firstName: "Mukesh",
      middleName: "Amaresh",
      lastName: "Thakur",
      image: "mukesh.jpg",
      branchId: branch.id,
      currentSemesterId: semester.id,
    },
  });

  // 7) Enrollment pivot: ensure student is enrolled in subject
  await prisma.enrollment.upsert({
    where: {
      studentId_subjectId: {
        studentId: student.id,
        subjectId: subject.id,
      },
    },
    update: { status: "active" },
    create: {
      studentId: student.id,
      subjectId: subject.id,
      status: "active",
    },
  });

  // 8) Create 20 deterministic class sessions for the subject
  //    We set explicit ids so upsert is deterministic and repeatable.
  const sessionDateBase = new Date();
  sessionDateBase.setHours(8, 0, 0, 0); // start-of-day baseline

  const totalSessions = 20;
  for (let i = 1; i <= totalSessions; i++) {
    const sessionId = `${subject.code}-s-${i}`; // deterministic id
    const sessionDate = new Date(sessionDateBase.getTime() - (totalSessions - i) * 24 * 60 * 60 * 1000); // older to newer

    await prisma.classSessions.upsert({
      where: { id: sessionId },
      update: {
        date: sessionDate,
        startTime: sessionDate,
        endTime: new Date(sessionDate.getTime() + 60 * 60 * 1000), // +1 hour
        topic: `Lecture ${i} - ${subject.name}`,
        subjectId: subject.id,
        teacherId: teacher.id,
      },
      create: {
        id: sessionId,
        date: sessionDate,
        startTime: sessionDate,
        endTime: new Date(sessionDate.getTime() + 60 * 60 * 1000),
        topic: `Lecture ${i} - ${subject.name}`,
        subjectId: subject.id,
        teacherId: teacher.id,
      },
    });
  }

  // 9) Seed attendance records for the student for each session
  //    Mark first 18 as PRESENT (score 1.0), 19th as LATE (score 0.8), 20th as ABSENT (score 0)
  for (let i = 1; i <= totalSessions; i++) {
    const sessionId = `${subject.code}-s-${i}`;

    // decide status & score
    let status: "PRESENT" | "LATE" | "VERY_LATE" | "ABSENT" = "ABSENT";
    let score = 0.0;
    if (i <= 18) {
      status = "PRESENT";
      score = 1.0;
    } else if (i === 19) {
      status = "LATE";
      score = 0.8;
    } else {
      status = "ABSENT";
      score = 0.0;
    }

    await prisma.attendanceRecord.upsert({
      where: {
        studentId_sessionId: { studentId: student.id, sessionId },
      },
      update: {
        scanTime: new Date(),
        arrivalTime: new Date(),
        score,
        status,
        deviceId: "seed-script",
        markedBy: "MANUAL_SYSTEM",
        notes: "seeded-record",
      },
      create: {
        studentId: student.id,
        sessionId,
        scanTime: new Date(),
        arrivalTime: new Date(),
        score,
        status,
        deviceId: "seed-script",
        markedBy: "MANUAL_SYSTEM",
        notes: "seeded-record",
      },
    });
  }

  console.log("✅ Seed completed (branch, semester, teacher, subject, student, enrollment, sessions, attendance).");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
