/*
  Warnings:

  - The values [MANUAL_SYSTEM] on the enum `MarkedBy` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `image` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `teachers` table. All the data in the column will be lost.
  - You are about to drop the column `isEmailVerified` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `isPhoneVerified` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `isProfileComplete` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `email_verification_tokens` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[code]` on the table `departments` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "MarkedBy_new" AS ENUM ('RFID', 'FINGERPRINT', 'MANUAL', 'SYSTEM');
ALTER TABLE "public"."attendance_records" ALTER COLUMN "markedBy" DROP DEFAULT;
ALTER TABLE "attendance_records" ALTER COLUMN "markedBy" TYPE "MarkedBy_new" USING ("markedBy"::text::"MarkedBy_new");
ALTER TYPE "MarkedBy" RENAME TO "MarkedBy_old";
ALTER TYPE "MarkedBy_new" RENAME TO "MarkedBy";
DROP TYPE "public"."MarkedBy_old";
ALTER TABLE "attendance_records" ALTER COLUMN "markedBy" SET DEFAULT 'MANUAL';
COMMIT;

-- DropForeignKey
ALTER TABLE "email_verification_tokens" DROP CONSTRAINT "email_verification_tokens_userId_fkey";

-- DropIndex
DROP INDEX "users_phone_key";

-- AlterTable
ALTER TABLE "attendance_records" ALTER COLUMN "markedBy" SET DEFAULT 'MANUAL';

-- AlterTable
ALTER TABLE "branches" ADD COLUMN     "description" TEXT,
ADD COLUMN     "image" TEXT;

-- AlterTable
ALTER TABLE "departments" ADD COLUMN     "code" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "image" TEXT;

-- AlterTable
ALTER TABLE "students" DROP COLUMN "image",
ADD COLUMN     "address" TEXT,
ADD COLUMN     "emergencyContact" TEXT;

-- AlterTable
ALTER TABLE "subjects" ADD COLUMN     "image" TEXT;

-- AlterTable
ALTER TABLE "teachers" DROP COLUMN "image";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "isEmailVerified",
DROP COLUMN "isPhoneVerified",
DROP COLUMN "isProfileComplete",
ADD COLUMN     "image" TEXT,
ALTER COLUMN "phone" DROP NOT NULL;

-- DropTable
DROP TABLE "email_verification_tokens";

-- CreateIndex
CREATE UNIQUE INDEX "departments_code_key" ON "departments"("code");
