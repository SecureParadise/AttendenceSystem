// prisma/teacherSeed.ts
import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  // use same branch/semester conventions (ensure they exist)
  const dept = await prisma.department.upsert({
    where: { name: "Electronics & Computer" },
    update: {},
    create: { name: "Electronics & Computer" },
  });

  const branch = await prisma.branch.upsert({
    where: { code: "ECIE" },
    update: { name: "Electronics Communication & Information Engineering", departmentId: dept.id },
    create: { code: "ECIE", name: "Electronics Communication & Information Engineering", departmentId: dept.id },
  });

  const semester = await prisma.semester.upsert({
    where: { branchId_number: { branchId: branch.id, number: 5 } },
    update: { name: "5th Semester" },
    create: { branchId: branch.id, number: 5, name: "5th Semester" },
  });

  // create teacher user (example: Bhupendra Pandey) — idempotent
  const teacherUser = await prisma.user.upsert({
    where: { email: "bp@campus.test" },
    update: { role: "TEACHER" },
    create: { email: "bp@campus.test", phone: "9800000002", passwordHash: "teacherSeedPass", role: "TEACHER", isEmailVerified: true },
  });

  // find or create teacher record safely (avoid userId unique conflict)
  let teacher = await prisma.teacher.findUnique({ where: { userId: teacherUser.id } });
  if (!teacher) {
    // fallback: create with a deterministic cardNo
    const cardNo = `t_bp_001`;
    teacher = await prisma.teacher.upsert({
      where: { cardNo },
      update: {
        userId: teacherUser.id,
        firstName: "Biplove",
        lastName: "Pokhrel",
        departmentId: dept.id,
        image: "placeholder.jpg",
      },
      create: {
        userId: teacherUser.id,
        cardNo,
        firstName: "Biplove",
        lastName: "Pokhrel",
        designation: "Lecturer",
        departmentId: dept.id,
        image: "placeholder.jpg",
      },
    });
  }

  // Assign this teacher to multiple 5th-sem subjects (if they exist).
  const subjectCodes = ["OS", "COA", "OS-LAB", "COA-LAB"]; // subjects teacher will own
  for (const code of subjectCodes) {
    // if subject exists, attach the teacher id
    const sub = await prisma.subject.findUnique({ where: { code } });
    if (sub) {
      await prisma.subject.update({ where: { id: sub.id }, data: { teacherId: teacher.id } });
      console.log(`Assigned ${teacher.firstName} to subject ${code}`);
    } else {
      console.log(`Subject ${code} not found — skipping`);
    }
  }

  console.log("✅ Teacher seed completed. Teacher id:", teacher.id);
}

main()
  .catch((e) => {
    console.error("seed_teacher error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
