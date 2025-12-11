// prisma/seed_branch_dept.ts

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client";
// import { PrismaClient } from '../prisma/generated/client'

// import prisma from "@/lib/prisma";
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({adapter})




async function main() {
  // 1) Departments (using name as unique, same as your schema)
  const deptApplied = await prisma.department.upsert({
    where: { name: "Department of Applied Sciences" },
    update: {},
    create: { name: "Department of Applied Sciences" },
  });

  const deptCivil = await prisma.department.upsert({
    where: { name: "Department of Civil Engineering" },
    update: {},
    create: { name: "Department of Civil Engineering" },
  });

  const deptElectrical = await prisma.department.upsert({
    where: { name: "Department of Electrical Engineering" },
    update: {},
    create: { name: "Department of Electrical Engineering" },
  });

  const deptElectronics = await prisma.department.upsert({
    where: {
      name: "Department of Electronics & Computer Engineering",
    },
    update: {},
    create: {
      name: "Department of Electronics & Computer Engineering",
    },
  });

  const deptMechanical = await prisma.department.upsert({
    where: {
      name: "Department of Mechanical & Automobile Engineering",
    },
    update: {},
    create: {
      name: "Department of Mechanical & Automobile Engineering",
    },
  });

  const deptGeomatics = await prisma.department.upsert({
    where: { name: "Department of Geomatics Engineering" },
    update: {},
    create: { name: "Department of Geomatics Engineering" },
  });

  // 2) Branches (codes MUST match BRANCH_OPTIONS[].value)
  await prisma.branch.upsert({
    where: { code: "BCE" },
    update: {},
    create: {
      name: "Bachelor of Civil Engineering",
      code: "BCE",
      departmentId: deptCivil.id,
    },
  });

  await prisma.branch.upsert({
    where: { code: "BEL" },
    update: {},
    create: {
      name: "Bachelor of Electrical Engineering",
      code: "BEL",
      departmentId: deptElectrical.id,
    },
  });

  await prisma.branch.upsert({
    where: { code: "BEI" },
    update: {},
    create: {
      name: "Bachelor of Electronics and Information Engineering",
      code: "BEI",
      departmentId: deptElectronics.id,
    },
  });

  await prisma.branch.upsert({
    where: { code: "BCT" },
    update: {},
    create: {
      name: "Bachelor of Computer Engineering",
      code: "BCT",
      departmentId: deptElectronics.id,
    },
  });

  await prisma.branch.upsert({
    where: { code: "BME" },
    update: {},
    create: {
      name: "Bachelor of Mechanical Engineering",
      code: "BME",
      departmentId: deptMechanical.id,
    },
  });

  await prisma.branch.upsert({
    where: { code: "BAME" },
    update: {},
    create: {
      name: "Bachelor of Automobile Engineering",
      code: "BAME",
      departmentId: deptMechanical.id,
    },
  });

  await prisma.branch.upsert({
    where: { code: "BGE" },
    update: {},
    create: {
      name: "Bachelor of Geomatics Engineering",
      code: "BGE",
      departmentId: deptGeomatics.id,
    },
  });

  // 3) Optional: create 8 semesters for each branch
  const branches = await prisma.branch.findMany();

  for (const branch of branches) {
    for (let semester = 1; semester <= 8; semester++) {
      await prisma.semester.upsert({
        where: {
          // uses @@unique([branchId, number]) in schema
          branchId_number: {
            branchId: branch.id,
            number: semester,
          },
        },
        update: {},
        create: {
          branchId: branch.id,
          number: semester,
          name: `Semester ${semester}`,
        },
      });
    }
  }

  console.log("✅ Seed completed");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
