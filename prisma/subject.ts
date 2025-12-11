// prisma/subject.ts

import { PrismaClient } from '@/app/generated/prisma/client';
import * as bcrypt from "bcrypt";
import { PrismaPg } from '@prisma/adapter-pg'
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({adapter});

const TEACHERS = [
  { first: "Hom", middle: "Nath", last: "Tiwari", designation: "Lecturer", spec: "Electronics and Computer" },
  { first: "hari", middle: "prasad", last: "baral", designation: "Lecturer", spec: "" },
  { first: "ramesh", middle: "", last: "thapa", designation: "Lecturer", spec: "" },
  { first: "khemraj", middle: "", last: "koirala", designation: "Lecturer", spec: "" },
  { first: "laxmi", middle: "prasad", last: "bastola", designation: "Lecturer", spec: "" },
  { first: "sharan", middle: "", last: "thapa", designation: "Lecturer", spec: "" },
  { first: "bal", middle: "krishna", last: "neupane", designation: "Lecturer", spec: "" },
  { first: "raj", middle: "kiran", last: "chhatakuli", designation: "Lecturer", spec: "" },
  { first: "Roshan", middle: "", last: "subedi", designation: "Lecturer", spec: "" },
  { first: "Nabin", middle: "", last: "Lamichhane", designation: "Lecturer", spec: "" },
  { first: "Bishnu", middle: "Hari", last: "Paudel", designation: "Lecturer", spec: "" },
];

const SPECIALIZATIONS = [
  "Communication Systems",
  "Digital Electronics",
  "Microprocessors & Embedded Systems",
  "Signal Processing",
  "Computer Networks",
  "Control Systems",
  "VLSI & Semiconductor Devices",
  "Wireless Communication",
  "Power Electronics",
  "Embedded & IoT",
];

function pickRandom<T>(arr: T[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}
function genCard(existing: Set<string>) {
  while (true) {
    const n = Math.floor(100 + Math.random() * 900);
    const c = `exe${n}`;
    if (!existing.has(c)) {
      existing.add(c);
      return c;
    }
  }
}

async function safeCreateUser(emailBase: string, phoneBase: string) {
  // ensure unique email
  let email = `${emailBase}@campus.test`;
  let suffix = 0;
  while (await prisma.user.findUnique({ where: { email } })) {
    suffix += 1;
    email = `${emailBase}${suffix}@campus.test`;
  }

  // ensure unique phone
  let phone = phoneBase;
  suffix = 0;
  while (await prisma.user.findUnique({ where: { phone } })) {
    suffix += 1;
    phone = phoneBase.slice(0, -1) + String((Number(phoneBase.slice(-1)) + suffix) % 10);
  }

  const passwordHash = await bcrypt.hash("ChangeMe123!", 10);

  return prisma.user.create({
    data: {
      email,
      phone,
      passwordHash,
      role: "TEACHER",
      isEmailVerified: false,
    },
  });
}

async function main() {
  // 1) Create Department and Branch (Electronics & Computer / ECIE)
  const department = await prisma.department.upsert({
    where: { name: "Electronics & Computer" },
    update: {},
    create: { name: "Electronics & Computer" },
  });

  const branch = await prisma.branch.upsert({
    where: { code: "ECIE" },
    update: {},
    create: {
      name: "Electronics Communication & Information Engineering",
      code: "ECIE",
      departmentId: department.id,
    },
  });

  // 2) Create even semesters: 2,4,6,8 for this branch
  const semNumbers = [2, 4, 6, 8];
  const semesterMap: Record<number, any> = {};
  for (const sn of semNumbers) {
    const sem = await prisma.semester.upsert({
      where: { branchId_number: { branchId: branch.id, number: sn } },
      update: {},
      create: {
        number: sn,
        name: `Semester ${sn}`,
        branchId: branch.id,
      },
    });
    semesterMap[sn] = sem;
  }

  // 3) Seed teachers and collect their IDs
  const teacherIds: string[] = [];
  const usedCards = new Set<string>();
  for (const t of TEACHERS) {
    const firstName = t.first.trim();
    const middleName = t.middle ? t.middle.trim() : null;
    const lastName = t.last.trim();
    if (!firstName || !lastName) continue;

    const spec = t.spec && String(t.spec).trim() !== "" ? t.spec.trim() : pickRandom(SPECIALIZATIONS);
    const cardNo = genCard(usedCards);

    const emailBase = `${firstName.toLowerCase()}.${lastName.toLowerCase()}`;
    const phoneBase = "98" + Math.floor(10000000 + Math.random() * 90000000).toString();

    const user = await safeCreateUser(emailBase, phoneBase);

    // <<-- FIX: include required `image` field (schema requires non-nullable image)
    const teacher = await prisma.teacher.create({
      data: {
        userId: user.id,
        cardNo,
        firstName,
        middleName,
        lastName,
        designation: t.designation || "Lecturer",
        specialization: spec,
        departmentId: department.id,
        image: "placeholder.jpg",     // <-- ADDED: satisfies required schema field
      },
    });

    teacherIds.push(teacher.id);
    console.log(`Created teacher ${firstName} ${lastName} (${cardNo}) -> ${spec}`);
  }

  if (teacherIds.length === 0) {
    throw new Error("No teachers were created; cannot assign subjects.");
  }

  // 4) Subjects for even semesters (codes/titles taken from BEI syllabus PDF)
  const subjects = [
    // semester 2
    { code: "SH451", name: "Engineering Mathematics II", sem: 2 },
    { code: "EX452", name: "Microprocessor", sem: 2 },
    { code: "SH453", name: "Engineering Chemistry", sem: 2 },
    { code: "CT451", name: "Object Oriented Programming", sem: 2 },
    { code: "ME453", name: "Workshop Technology", sem: 2 },
    { code: "EE460", name: "Electric Circuits and Machines", sem: 2 },

    // semester 4
    { code: "SH551", name: "Applied Mathematics", sem: 4 },
    { code: "CT551", name: "Discrete Structure", sem: 4 },
    { code: "CT552", name: "Data Structure & Algorithms", sem: 4 },
    { code: "EX553", name: "Advanced Electronics", sem: 4 },
    { code: "EX554", name: "Computer Graphics", sem: 4 },
    { code: "SH553", name: "Numerical Methods", sem: 4 },

    // semester 6
    { code: "SH655", name: "Communication English", sem: 6 },
    { code: "CT658", name: "Project Management", sem: 6 },
    { code: "EX653", name: "Propagation and Antenna", sem: 6 },
    { code: "EX656", name: "Communication Systems", sem: 6 },
    { code: "CT657", name: "Object Oriented Software Engineering", sem: 6 },
    { code: "CT655", name: "Embedded Systems", sem: 6 },
    { code: "EX654", name: "Minor Project", sem: 6 },

    // semester 8
    { code: "EX756", name: "Telecommunications", sem: 8 },
    { code: "CE752", name: "Professional Practice", sem: 8 },
    { code: "EX757", name: "Energy, Environment and Society", sem: 8 },
    { code: "CT751", name: "Information Systems", sem: 8 },
    { code: "EX765", name: "Elective II", sem: 8 },
    { code: "EX785", name: "Elective III", sem: 8 },
    { code: "EX755", name: "Project (Part B)", sem: 8 },
  ];

  // 5) Create subjects, assign a random teacher to each
  for (const s of subjects) {
    const sem = semesterMap[s.sem];
    if (!sem) {
      console.log(`Skipping subject ${s.code} - semester ${s.sem} not found`);
      continue;
    }

    const teacherId = pickRandom(teacherIds);
    try {
      await prisma.subject.create({
        data: {
          name: s.name,
          code: s.code,
          isLab: false,
          credits: 3,
          branchId: branch.id,
          semesterId: sem.id,
          teacherId,
        },
      });
      console.log(`Created subject ${s.code} (${s.name}) -> sem ${s.sem}, teacher ${teacherId}`);
    } catch (err: any) {
      console.error(`Failed to create subject ${s.code}:`, err.message || err);
    }
  }

  console.log("Seeding complete.");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
