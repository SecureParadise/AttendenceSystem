/*
  Warnings:

  - You are about to drop the column `dob` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `emergencyContact` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `gender` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `employeeId` on the `teachers` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[cardNo]` on the table `teachers` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `cardNo` to the `teachers` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "teachers_employeeId_departmentId_idx";

-- DropIndex
DROP INDEX "teachers_employeeId_key";

-- AlterTable
ALTER TABLE "students" DROP COLUMN "dob",
DROP COLUMN "emergencyContact",
DROP COLUMN "gender",
ADD COLUMN     "image" TEXT;

-- AlterTable
ALTER TABLE "teachers" DROP COLUMN "employeeId",
ADD COLUMN     "cardNo" TEXT NOT NULL,
ADD COLUMN     "image" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "teachers_cardNo_key" ON "teachers"("cardNo");

-- CreateIndex
CREATE INDEX "teachers_cardNo_departmentId_idx" ON "teachers"("cardNo", "departmentId");
