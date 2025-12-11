/*
  Warnings:

  - The values [MANUAL,SYSTEM] on the enum `MarkedBy` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `description` on the `branches` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `branches` table. All the data in the column will be lost.
  - You are about to drop the column `cardNo` on the `crew` table. All the data in the column will be lost.
  - You are about to drop the column `code` on the `departments` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `departments` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `departments` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `subjects` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[employeeId]` on the table `crew` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[phone]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `employeeId` to the `crew` table without a default value. This is not possible if the table is not empty.
  - Made the column `image` on table `students` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `image` to the `teachers` table without a default value. This is not possible if the table is not empty.
  - Made the column `phone` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "MarkedBy_new" AS ENUM ('RFID', 'FINGERPRINT', 'MANUAL_SYSTEM');
ALTER TABLE "public"."attendance_records" ALTER COLUMN "markedBy" DROP DEFAULT;
ALTER TABLE "attendance_records" ALTER COLUMN "markedBy" TYPE "MarkedBy_new" USING ("markedBy"::text::"MarkedBy_new");
ALTER TYPE "MarkedBy" RENAME TO "MarkedBy_old";
ALTER TYPE "MarkedBy_new" RENAME TO "MarkedBy";
DROP TYPE "public"."MarkedBy_old";
ALTER TABLE "attendance_records" ALTER COLUMN "markedBy" SET DEFAULT 'RFID';
COMMIT;

-- DropIndex
DROP INDEX "crew_cardNo_department_idx";

-- DropIndex
DROP INDEX "crew_cardNo_key";

-- DropIndex
DROP INDEX "departments_code_key";

-- AlterTable
ALTER TABLE "attendance_records" ALTER COLUMN "markedBy" SET DEFAULT 'RFID';

-- AlterTable
ALTER TABLE "branches" DROP COLUMN "description",
DROP COLUMN "image";

-- AlterTable
ALTER TABLE "crew" DROP COLUMN "cardNo",
ADD COLUMN     "employeeId" TEXT NOT NULL,
ADD COLUMN     "permissions" JSONB;

-- AlterTable
ALTER TABLE "departments" DROP COLUMN "code",
DROP COLUMN "description",
DROP COLUMN "image";

-- AlterTable
ALTER TABLE "students" ADD COLUMN     "academicYear" TEXT,
ALTER COLUMN "image" SET NOT NULL;

-- AlterTable
ALTER TABLE "subjects" DROP COLUMN "image";

-- AlterTable
ALTER TABLE "teachers" ADD COLUMN     "image" TEXT NOT NULL,
ADD COLUMN     "roomNumber" TEXT;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "image",
ADD COLUMN     "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isPhoneVerified" BOOLEAN DEFAULT false,
ADD COLUMN     "isProfileComplete" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "phone" SET NOT NULL;

-- CreateTable
CREATE TABLE "email_verification_tokens" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "otp" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_verification_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "email_verification_tokens_userId_otp_idx" ON "email_verification_tokens"("userId", "otp");

-- CreateIndex
CREATE UNIQUE INDEX "crew_employeeId_key" ON "crew"("employeeId");

-- CreateIndex
CREATE INDEX "crew_employeeId_department_idx" ON "crew"("employeeId", "department");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- AddForeignKey
ALTER TABLE "email_verification_tokens" ADD CONSTRAINT "email_verification_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
