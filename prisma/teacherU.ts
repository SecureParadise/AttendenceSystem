
import * as bcrypt from "bcrypt";
import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({adapter});

// Teacher rows you provided (exact names & middle names)
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

// Random specialization pool (Electronics, Communication and related)
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

function randomSpec() {
  return SPECIALIZATIONS[Math.floor(Math.random() * SPECIALIZATIONS.length)];
}

function genCardNo(existing: Set<string>) {
  // attempt until unique in this run
  while (true) {
    const n = Math.floor(100 + Math.random() * 900); // 3-digit
    const card = `exe${n}`;
    if (!existing.has(card)) {
      existing.add(card);
      return card;
    }
  }
}

async function safeCreateUser(emailBase: string, phoneBase: string) {
  // ensure unique email; if collision append numeric suffix
  let email = `${emailBase}@campus.test`;
  let suffix = 0;
  // check existence
  while (await prisma.user.findUnique({ where: { email } })) {
    suffix += 1;
    email = `${emailBase}${suffix}@campus.test`;
  }

  // ensure phone uniqueness: append digits if needed
  let phone = phoneBase;
  suffix = 0;
  while (await prisma.user.findUnique({ where: { phone } })) {
    suffix += 1;
    phone = phoneBase.slice(0, -1) + String((Number(phoneBase.slice(-1)) + suffix) % 10);
  }

  // simple bcrypt hash for default password
  const passwordHash = await bcrypt.hash("ChangeMe123!", 10);

  const user = await prisma.user.create({
    data: {
      email,
      phone,
      passwordHash,
      role: "TEACHER",
      isEmailVerified: false,
    },
  });

  return user;
}

async function main() {
  // 1) Ensure Department exists (Electronics & Computer)
  const department = await prisma.department.upsert({
    where: { name: "Electronics & Computer" },
    update: {},
    create: { name: "Electronics & Computer" },
  });

  // 2) Ensure a branch for ECIE (code: ECIE)
  const branch = await prisma.branch.upsert({
    where: { code: "ECIE" },
    update: {},
    create: {
      name: "Electronics Communication & Information Engineering",
      code: "ECIE",
      departmentId: department.id,
    },
  });

  // track generated cardNos to avoid duplicates in single run
  const usedCards = new Set<string>();

  for (const row of TEACHERS) {
    const firstName = row.first.trim();
    const middleName = row.middle ? row.middle.trim() : null;
    const lastName = row.last.trim();
    const designation = row.designation || "Lecturer";

    if (!firstName || !lastName) {
      console.log("Skipping invalid row (missing name):", row);
      continue;
    }

    // specialization: use given if non-empty, otherwise pick random
    const specialization = row.spec && String(row.spec).trim() !== "" ? String(row.spec).trim() : randomSpec();

    // generate unique cardNo like exe123
    const cardNo = genCardNo(usedCards);

    // generate email base and phone base
    const emailBase = `${firstName.toLowerCase()}.${lastName.toLowerCase()}`;
    const phoneBase = "98" + String(Math.floor(10000000 + Math.random() * 90000000));

    // create user (ensures unique email/phone)
    const user = await safeCreateUser(emailBase, phoneBase);

    // create teacher record
    await prisma.teacher.create({
      data: {
        userId: user.id,
        cardNo,
        firstName,
        middleName,
        lastName,
        designation,
        specialization,
        image: "placeholder.jpg",
        departmentId: department.id,
      },
    });

    console.log(`Inserted teacher: ${firstName} ${lastName} (${cardNo}) -> ${specialization}`);
  }

  console.log("All teachers seeded.");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
