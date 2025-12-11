// prisma/fivesem.ts
import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

/**
 * Full idempotent seed for BEI 5th semester
 * - creates department, branch (ECIE), semester 5
 * - creates Mukesh user + student
 * - creates teachers (safe: avoids userId unique conflicts)
 * - creates subjects + enrollments
 * - creates deterministic class sessions per subject
 * - seeds attendance records for Mukesh (10 present, 1 late, 1 absent per subject)
 *
 * Run: npx tsx prisma/fivesem.ts  (or via `npx prisma db seed` if configured)
 */

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

type SubjectSeed = {
  code: string;
  name: string;
  isLab: boolean;
  credits: number;
  teacher: { first: string; last: string; email: string };
};

async function main() {
  /***********************
   * 1) Department/Branch
   ***********************/
  const dept = await prisma.department.upsert({
    where: { name: "Electronics & Computer" },
    update: {},
    create: { name: "Electronics & Computer" },
  });

  const branch = await prisma.branch.upsert({
    where: { code: "ECIE" },
    update: {
      name: "Electronics Communication & Information Engineering",
      departmentId: dept.id,
    },
    create: {
      name: "Electronics Communication & Information Engineering",
      code: "ECIE",
      departmentId: dept.id,
    },
  });

  const semester = await prisma.semester.upsert({
    where: { branchId_number: { branchId: branch.id, number: 5 } },
    update: { name: "5th Semester" },
    create: { branchId: branch.id, number: 5, name: "5th Semester" },
  });

  /****************************
   * 2) Ensure Mukesh (Student)
   ****************************/
  const studentUser = await prisma.user.upsert({
    where: { email: "pas078bei023@student.test" },
    update: { role: "STUDENT" },
    create: {
      email: "pas078bei023@student.test",
      phone: "9800000003",
      passwordHash: "studentSeedPass", // dev placeholder
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

  /***********************************************
   * 3) Subjects definitions (5th semester BEI)
   * You can edit teacher names/emails if needed.
   ***********************************************/
  const subjects: SubjectSeed[] = [
    { code: "OS", name: "Operating Systems", isLab: false, credits: 4, teacher: { first: "Bhupendra", last: "Pandey", email: "bp@campus.test" } },
    { code: "COA", name: "Computer Organization & Architecture", isLab: false, credits: 4, teacher: { first: "Bipin", last: "Humagain", email: "bh@campus.test" } },
    { code: "CN", name: "Computer Networks", isLab: false, credits: 4, teacher: { first: "Prakash", last: "Adhikari", email: "pa@campus.test" } },
    { code: "DBMS", name: "Database Management System", isLab: false, credits: 4, teacher: { first: "Ramesh", last: "K.C.", email: "rkc@campus.test" } },
    { code: "FD", name: "Filter Design", isLab: false, credits: 3, teacher: { first: "Bishnu", last: "Sharma", email: "bs@campus.test" } },
    { code: "EE", name: "Engineering Economics", isLab: false, credits: 3, teacher: { first: "Kamal", last: "Koirala", email: "kk@campus.test" } },

    // Labs
    { code: "CN-LAB", name: "Computer Networks Lab", isLab: true, credits: 1, teacher: { first: "Prakash", last: "Adhikari", email: "pa@campus.test" } },
    { code: "DBMS-LAB", name: "Database Management System Lab", isLab: true, credits: 1, teacher: { first: "Ramesh", last: "K.C.", email: "rkc@campus.test" } },
    { code: "OS-LAB", name: "Operating Systems Lab", isLab: true, credits: 1, teacher: { first: "Bhupendra", last: "Pandey", email: "bp@campus.test" } },
    { code: "COA-LAB", name: "COA Lab", isLab: true, credits: 1, teacher: { first: "Bipin", last: "Humagain", email: "bh@campus.test" } },
    { code: "FD-LAB", name: "Filter Design Lab", isLab: true, credits: 1, teacher: { first: "Bishnu", last: "Sharma", email: "bs@campus.test" } },
  ];

  /****************************************
   * 4) For each subject: create teacher,
   *    subject, enrollment, sessions, attendance
   ****************************************/
  for (const s of subjects) {
    // 4.a) Create or reuse teacher user
    const teacherUser = await prisma.user.upsert({
      where: { email: s.teacher.email },
      update: { role: "TEACHER" },
      create: {
        email: s.teacher.email,
        phone: "98" + Math.floor(10000000 + Math.random() * 90000000).toString(),
        passwordHash: "teacherSeedPass",
        role: "TEACHER",
        isEmailVerified: true,
      },
    });

    // 4.b) Safe teacher record creation/update to avoid userId unique conflict
    const cardNo = `t_${s.code.toLowerCase().replace(/[^a-z0-9]/g, "")}`;

    // prefer teacher by userId
    let teacher = await prisma.teacher.findUnique({ where: { userId: teacherUser.id } });

    // if not found, try by cardNo
    if (!teacher) {
      teacher = await prisma.teacher.findUnique({ where: { cardNo } }).catch(() => null);
    }

    if (teacher) {
      // update existing teacher record (safe)
      teacher = await prisma.teacher.update({
        where: { id: teacher.id },
        data: {
          userId: teacherUser.id,
          cardNo,
          firstName: s.teacher.first,
          lastName: s.teacher.last,
          designation: "Lecturer",
          departmentId: dept.id,
          image: "placeholder.jpg",
        },
      });
    } else {
      // create new teacher
      teacher = await prisma.teacher.create({
        data: {
          userId: teacherUser.id,
          cardNo,
          firstName: s.teacher.first,
          lastName: s.teacher.last,
          designation: "Lecturer",
          departmentId: dept.id,
          image: "placeholder.jpg",
        },
      });
    }

    // 4.c) Upsert subject
    const subject = await prisma.subject.upsert({
      where: { code: s.code },
      update: {
        name: s.name,
        semesterId: semester.id,
        branchId: branch.id,
        teacherId: teacher.id,
        isLab: s.isLab,
        credits: s.credits,
      },
      create: {
        code: s.code,
        name: s.name,
        semesterId: semester.id,
        branchId: branch.id,
        teacherId: teacher.id,
        isLab: s.isLab,
        credits: s.credits,
      },
    });

    // 4.d) Ensure enrollment exists for Mukesh
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

    /*****************************************************
     * 4.e) Create deterministic class sessions for subject
     *      (12 sessions each) and seed attendance for Mukesh
     *****************************************************/
    const totalSessions = 12;
    // baseline date: today at 9:00 - we will set sessions in increasing day offsets
    const baseline = new Date();
    baseline.setHours(9, 0, 0, 0);

    for (let i = 1; i <= totalSessions; i++) {
      // deterministic session id so upsert is repeatable
      const sessionId = `${subject.code}-s-${i}`;

      // create session date spaced daily in the past (older sessions earlier)
      const sessionDate = new Date(baseline.getTime() - (totalSessions - i) * 24 * 60 * 60 * 1000);

      await prisma.classSessions.upsert({
        where: { id: sessionId },
        update: {
          date: sessionDate,
          startTime: sessionDate,
          endTime: new Date(sessionDate.getTime() + 60 * 60 * 1000), // 1 hour
          topic: `${subject.name} - Lecture ${i}`,
          subjectId: subject.id,
          teacherId: teacher.id,
        },
        create: {
          id: sessionId,
          date: sessionDate,
          startTime: sessionDate,
          endTime: new Date(sessionDate.getTime() + 60 * 60 * 1000),
          topic: `${subject.name} - Lecture ${i}`,
          subjectId: subject.id,
          teacherId: teacher.id,
        },
      });

      // 4.f) Upsert attendance for Mukesh for this session
      // present for first 10 sessions, 11th = LATE, 12th = ABSENT
      let status: "PRESENT" | "LATE" | "VERY_LATE" | "ABSENT" = "ABSENT";
      let score = 0.0;
      if (i <= 10) {
        status = "PRESENT";
        score = 1.0;
      } else if (i === 11) {
        status = "LATE";
        score = 0.8;
      } else {
        status = "ABSENT";
        score = 0.0;
      }

      // Composite unique key name expected: studentId_sessionId (per schema)
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
          notes: "seeded-by-fivesem",
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
          notes: "seeded-by-fivesem",
        },
      });
    }

    console.log(`Seeded subject ${subject.code} -> ${subject.name} (teacher: ${teacher.firstName} ${teacher.lastName})`);
  } // end subjects loop

  console.log("✅ Completed 5th-semester full seed (subjects, teachers, enrollments, sessions, attendance).");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
