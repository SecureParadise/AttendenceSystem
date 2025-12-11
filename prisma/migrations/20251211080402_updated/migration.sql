/*
  Warnings:

  - You are about to drop the column `employeeId` on the `crew` table. All the data in the column will be lost.
  - You are about to drop the column `permissions` on the `crew` table. All the data in the column will be lost.
  - You are about to drop the column `academicYear` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `address` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `emergencyContact` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `roomNumber` on the `teachers` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[cardNo]` on the table `crew` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `cardNo` to the `crew` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "crew_employeeId_department_idx";

-- DropIndex
DROP INDEX "crew_employeeId_key";

-- AlterTable
ALTER TABLE "crew" DROP COLUMN "employeeId",
DROP COLUMN "permissions",
ADD COLUMN     "cardNo" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "students" DROP COLUMN "academicYear",
DROP COLUMN "address",
DROP COLUMN "emergencyContact",
ADD COLUMN     "image" TEXT;

-- AlterTable
ALTER TABLE "teachers" DROP COLUMN "roomNumber";

-- CreateIndex
CREATE UNIQUE INDEX "crew_cardNo_key" ON "crew"("cardNo");

-- CreateIndex
CREATE INDEX "crew_cardNo_department_idx" ON "crew"("cardNo", "department");
