// prisma/semester.ts
import { PrismaClient } from '@/app/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  // 1) Find the target branch (try several likely identifiers)
  const branch = await prisma.branch.findFirst({
    where: {
      OR: [
        { code: "electronics" },
        { code: "ECIE" },
        { name: "Electronics & Computer" },
        { name: "Electronics Communication & Information Engineering" },
      ],
    },
  });

  let targetBranch = branch;
  if (!targetBranch) {
    console.log("Branch not found. Creating Electronics & Computer department + branch...");
    const department = await prisma.department.upsert({
      where: { name: "Electronics & Computer" },
      update: {},
      create: { name: "Electronics & Computer" },
    });

    targetBranch = await prisma.branch.create({
      data: {
        name: "Electronics Communication & Information Engineering",
        code: "electronics",
        departmentId: department.id,
      },
    });

    console.log(`Created branch: ${targetBranch.name} (${targetBranch.id})`);
  } else {
    console.log(`Found branch: ${targetBranch.name} (id: ${targetBranch.id}, code: ${targetBranch.code})`);
  }

  // 2) Gather semester ids that belong to this branch
  const existingSemesters = await prisma.semester.findMany({
    where: { branchId: targetBranch.id },
    select: { id: true, number: true },
  });

  const semesterIds = existingSemesters.map((s) => s.id);
  if (semesterIds.length === 0) {
    console.log("No existing semesters found for branch; skipping delete phase.");
  } else {
    console.log(`Found ${semesterIds.length} semester(s). Preparing to delete dependent data...`);

    // 3) Gather subject ids for these semesters
    const subjects = await prisma.subject.findMany({
      where: { semesterId: { in: semesterIds } },
      select: { id: true },
    });
    const subjectIds = subjects.map((s) => s.id);

    // 4) Gather class session ids for those subjects
    const sessions = await prisma.classSessions.findMany({
      where: { subjectId: { in: subjectIds } },
      select: { id: true },
    });
    const sessionIds = sessions.map((s) => s.id);

    // 5) Delete attendance records that reference these sessions
    if (sessionIds.length > 0) {
      const delAttendance = await prisma.attendanceRecord.deleteMany({
        where: { sessionId: { in: sessionIds } },
      });
      console.log(`Deleted ${delAttendance.count} attendance record(s).`);
    } else {
      console.log("No class sessions found; skipping attendance delete.");
    }

    // 6) Delete class sessions
    if (sessionIds.length > 0) {
      const delSessions = await prisma.classSessions.deleteMany({
        where: { id: { in: sessionIds } },
      });
      console.log(`Deleted ${delSessions.count} class session(s).`);
    }

    // 7) Delete subjects belonging to these semesters
    if (subjectIds.length > 0) {
      const delSubjects = await prisma.subject.deleteMany({
        where: { id: { in: subjectIds } },
      });
      console.log(`Deleted ${delSubjects.count} subject(s).`);
    } else {
      console.log("No subjects found for these semesters; skipping subject delete.");
    }

    // 8) Unlink students who have currentSemesterId pointing to these semesters
    const updatedStudents = await prisma.student.updateMany({
      where: { currentSemesterId: { in: semesterIds } },
      data: { currentSemesterId: null },
    });
    console.log(`Unlinked ${updatedStudents.count} student(s) from their currentSemester.`);

    // 9) Now safe to delete semesters
    const delSem = await prisma.semester.deleteMany({
      where: { id: { in: semesterIds } },
    });
    console.log(`Deleted ${delSem.count} semester(s).`);
  }

  // 10) Create semesters 1..8 (idempotent: create new ones after deletion)
  const created = [];
  for (let i = 1; i <= 8; i++) {
    const sem = await prisma.semester.create({
      data: {
        number: i,
        name: `semester_${i}`,
        branchId: targetBranch.id,
      },
    });
    created.push(sem);
    console.log(`Created semester: number=${i}, id=${sem.id}`);
  }

  console.log(`Done: created ${created.length} semester records for branch ${targetBranch.code || targetBranch.name}`);
}

main()
  .catch((err) => {
    console.error("Seed error:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });