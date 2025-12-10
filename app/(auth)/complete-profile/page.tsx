// app/(app)/complete-profile/page.tsx
"use client";

import React, { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import LeftDecorator from "@/components/sidebar/LeftDecorator";

import { GraduationCap, IdCard, User, BadgeInfo } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/* ------------------------Constants & types -------- */
// Student constants
const BATCH_VALUES = [2078, 2079, 2080, 2081, 2082] as const;
const BATCH_OPTIONS = BATCH_VALUES.map((year) => ({
  value: year.toString(),
  label: `${year} Batch`,
}));

const BRANCH_OPTIONS = [
  { value: "BCE", label: "BCE" },
  { value: "BEL", label: "BEL" },
  { value: "BEI", label: "BEI" },
  { value: "BCT", label: "BCT" },
  { value: "BME", label: "BME" },
  { value: "BAME", label: "BAME" },
  { value: "BGE", label: "BGE" },
] as const;

const SEMESTER_OPTIONS = Array.from({ length: 8 }, (_, i) => ({
  value: (i + 1).toString(),
  label: `Semester ${i + 1}`,
}));

// Teacher constants
const DEPARTMENT_OPTIONS = [
  { value: "dept_applied_sciences", label: "Department of Applied Sciences" },
  { value: "dept_civil", label: "Department of Civil Engineering" },
  { value: "dept_electrical", label: "Department of Electrical Engineering" },
  {
    value: "dept_electronics",
    label: "Department of Electronics & Computer Engineering",
  },
  {
    value: "dept_mechanical",
    label: "Department of Mechanical & Automobile Engineering",
  },
  { value: "dept_geomatics", label: "Department of Geomatics Engineering" },
] as const;

const DESIGNATION_OPTIONS = [
  { value: "professor", label: "Professor" },
  { value: "reader", label: "Reader" },
  { value: "senior_lecturer", label: "Senior Lecturer" },
  { value: "lecturer", label: "Lecturer" },
  { value: "assistant_lecturer", label: "Assistant Lecturer" },
] as const;

/* --------------------------------------
   1) Zod schemas (LOGIC FIXED)
-------------------------------------- */
// Student profile schema
// NOTE: use branchCode + currentSemesterNumber (not DB ids)
const studentProfileSchema = z.object({
  rollNo: z.string().min(1, { message: "Roll number is required" }),
  firstName: z.string().min(1, { message: "First name is required" }),
  middleName: z.string().optional(),
  lastName: z.string().min(1, { message: "Last name is required" }),
  branchCode: z.string().min(1, { message: "Branch is required" }),
  currentSemesterNumber: z.string().min(1, {
    message: "Semester is required",
  }),
  batch: z.string().min(1, { message: "Batch is required" }),
});

type StudentProfileFormType = z.infer<typeof studentProfileSchema>;

// Teacher profile schema
// NOTE: use departmentKey (not DB id)
const teacherProfileSchema = z.object({
  cardNo: z.string().min(1, { message: "ID / Card number is required" }),
  firstName: z.string().min(1, { message: "First name is required" }),
  middleName: z.string().optional(),
  lastName: z.string().min(1, { message: "Last name is required" }),
  designation: z.string().min(1, { message: "Designation is required" }),
  departmentKey: z.string().min(1, { message: "Department is required" }),
  specialization: z.string().optional(),
});

type TeacherProfileFormType = z.infer<typeof teacherProfileSchema>;

/* --------------------------------------
   2) Student form component
-------------------------------------- */

const StudentProfileForm: React.FC<{ email: string }> = ({ email }) => {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<StudentProfileFormType>({
    resolver: zodResolver(studentProfileSchema),
  });

  const selectedBatch = watch("batch");
  const selectedBranchCode = watch("branchCode");
  const selectedSemesterNumber = watch("currentSemesterNumber");

  const onSubmit = async (values: StudentProfileFormType) => {
    try {
      const res = await fetch("/api/complete-profile/student", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          email,
        }),
      });

      const data = (await res.json().catch(() => ({}))) as {
        message?: string;
        redirectTo?: string;
      };

      if (!res.ok) {
        alert(data.message || "Failed to complete profile. Please try again.");
        return;
      }

      alert(data.message || "Profile completed successfully!");

      if (data.redirectTo) {
        router.push(data.redirectTo);
      } else {
        router.push("/dashboard");
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        alert(err.message || "Something went wrong. Please try again.");
      } else {
        alert("Something went wrong. Please try again.");
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 md:space-y-6">
      {/* Name fields */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label
            htmlFor="firstName"
            className={`font-semibold ${
              errors.firstName ? "text-red-600" : "text-blue-800"
            }`}
          >
            First Name *
          </Label>
          <Input
            id="firstName"
            placeholder="First Name"
            {...register("firstName")}
            className={`h-11 rounded-xl border ${
              errors.firstName
                ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                : "border-blue-200 focus:border-blue-500 focus:ring-blue-500"
            }`}
          />
          {errors.firstName && (
            <p className="text-sm text-red-600 mt-1">
              {errors.firstName.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="middleName" className="font-semibold text-blue-800">
            Middle Name
          </Label>
          <Input
            id="middleName"
            placeholder="Middle Name (optional)"
            {...register("middleName")}
            className="h-11 rounded-xl border border-blue-200 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="lastName"
            className={`font-semibold ${
              errors.lastName ? "text-red-600" : "text-blue-800"
            }`}
          >
            Last Name *
          </Label>
          <Input
            id="lastName"
            placeholder="Last Name"
            {...register("lastName")}
            className={`h-11 rounded-xl border ${
              errors.lastName
                ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                : "border-blue-200 focus:border-blue-500 focus:ring-blue-500"
            }`}
          />
          {errors.lastName && (
            <p className="text-sm text-red-600 mt-1">
              {errors.lastName.message}
            </p>
          )}
        </div>
      </div>

      {/* Roll No + Batch */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label
            htmlFor="rollNo"
            className={`font-semibold flex items-center gap-2 ${
              errors.rollNo ? "text-red-600" : "text-blue-800"
            }`}
          >
            <IdCard size={16} />
            Roll Number *
          </Label>
          <Input
            id="rollNo"
            placeholder="eg. 078BEI023"
            {...register("rollNo")}
            className={`h-11 rounded-xl border ${
              errors.rollNo
                ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                : "border-blue-200 focus:border-blue-500 focus:ring-blue-500"
            }`}
          />
          {errors.rollNo && (
            <p className="text-sm text-red-600 mt-1">{errors.rollNo.message}</p>
          )}
        </div>
        {/* Batch */}
        <div className="space-y-2">
          <Label
            htmlFor="batch"
            className={`font-semibold ${
              errors.batch ? "text-red-600" : "text-blue-800"
            }`}
          >
            Batch *
          </Label>
          <Select
            value={selectedBatch}
            onValueChange={(value) =>
              setValue("batch", value, { shouldValidate: true })
            }
          >
            <SelectTrigger
              className={`h-11 rounded-xl border ${
                errors.batch
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                  : "border-blue-200 focus:border-blue-500 focus:ring-blue-500"
              }`}
            >
              <SelectValue placeholder="Select batch" />
            </SelectTrigger>
            <SelectContent>
              {BATCH_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.batch && (
            <p className="text-sm text-red-600 mt-1">{errors.batch.message}</p>
          )}
        </div>
      </div>

      {/* Branch + Semester */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label
            htmlFor="branchCode"
            className={`font-semibold ${
              errors.branchCode ? "text-red-600" : "text-blue-800"
            }`}
          >
            Branch *
          </Label>
          <Select
            value={selectedBranchCode}
            onValueChange={(value) =>
              setValue("branchCode", value, { shouldValidate: true })
            }
          >
            <SelectTrigger
              className={`h-11 rounded-xl border ${
                errors.branchCode
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                  : "border-blue-200 focus:border-blue-500 focus:ring-blue-500"
              }`}
            >
              <SelectValue placeholder="Select branch" />
            </SelectTrigger>
            <SelectContent>
              {BRANCH_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.branchCode && (
            <p className="text-sm text-red-600 mt-1">
              {errors.branchCode.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="currentSemesterNumber"
            className={`font-semibold ${
              errors.currentSemesterNumber ? "text-red-600" : "text-blue-800"
            }`}
          >
            Current Semester *
          </Label>
          <Select
            value={selectedSemesterNumber}
            onValueChange={(value) =>
              setValue("currentSemesterNumber", value, {
                shouldValidate: true,
              })
            }
          >
            <SelectTrigger
              className={`h-11 rounded-xl border ${
                errors.currentSemesterNumber
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                  : "border-blue-200 focus:border-blue-500 focus:ring-blue-500"
              }`}
            >
              <SelectValue placeholder="Select semester" />
            </SelectTrigger>
            <SelectContent>
              {SEMESTER_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.currentSemesterNumber && (
            <p className="text-sm text-red-600 mt-1">
              {errors.currentSemesterNumber.message}
            </p>
          )}
        </div>
      </div>

      {/* Submit */}
      <div className="pt-4 flex justify-center">
        <div className="w-3/4 md:w-1/2 lg:w-1/3">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 md:py-4 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-base md:text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Saving profile..." : "Save Student Profile"}
          </Button>
        </div>
      </div>
    </form>
  );
};

/* --------------------------------------
   3) Teacher form component
-------------------------------------- */

const TeacherProfileForm: React.FC<{ email: string }> = ({ email }) => {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<TeacherProfileFormType>({
    resolver: zodResolver(teacherProfileSchema),
  });

  const selectedDepartmentKey = watch("departmentKey");
  const selectedDesignation = watch("designation");

  const onSubmit = async (values: TeacherProfileFormType) => {
    try {
      const res = await fetch("/api/complete-profile/teacher", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          email,
        }),
      });

      const data = (await res.json().catch(() => ({}))) as {
        message?: string;
        redirectTo?: string;
      };

      if (!res.ok) {
        alert(data.message || "Failed to complete profile. Please try again.");
        return;
      }

      alert(data.message || "Profile completed successfully!");

      if (data.redirectTo) {
        router.push(data.redirectTo);
      } else {
        router.push("/dashboard");
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        alert(err.message || "Something went wrong. Please try again.");
      } else {
        alert("Something went wrong. Please try again.");
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 md:space-y-6">
      {/* Card No */}
      <div className="space-y-2">
        <Label
          htmlFor="cardNo"
          className={`font-semibold flex items-center gap-2 ${
            errors.cardNo ? "text-red-600" : "text-blue-800"
          }`}
        >
          <IdCard size={16} />
          Teacher ID / Card No *
        </Label>
        <Input
          id="cardNo"
          placeholder="eg. EXE-1234"
          {...register("cardNo")}
          className={`h-11 rounded-xl border ${
            errors.cardNo
              ? "border-red-500 focus:border-red-500 focus:ring-red-500"
              : "border-blue-200 focus:border-blue-500 focus:ring-blue-500"
          }`}
        />
        {errors.cardNo && (
          <p className="text-sm text-red-600 mt-1">{errors.cardNo.message}</p>
        )}
      </div>

      {/* Name fields */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label
            htmlFor="firstName"
            className={`font-semibold ${
              errors.firstName ? "text-red-600" : "text-blue-800"
            }`}
          >
            First Name *
          </Label>
          <Input
            id="firstName"
            placeholder="First Name"
            {...register("firstName")}
            className={`h-11 rounded-xl border ${
              errors.firstName
                ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                : "border-blue-200 focus:border-blue-500 focus:ring-blue-500"
            }`}
          />
          {errors.firstName && (
            <p className="text-sm text-red-600 mt-1">
              {errors.firstName.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="middleName" className="font-semibold text-blue-800">
            Middle Name
          </Label>
          <Input
            id="middleName"
            placeholder="Middle Name (optional)"
            {...register("middleName")}
            className="h-11 rounded-xl border border-blue-200 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="lastName"
            className={`font-semibold ${
              errors.lastName ? "text-red-600" : "text-blue-800"
            }`}
          >
            Last Name *
          </Label>
          <Input
            id="lastName"
            placeholder="Last Name"
            {...register("lastName")}
            className={`h-11 rounded-xl border ${
              errors.lastName
                ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                : "border-blue-200 focus:border-blue-500 focus:ring-blue-500"
            }`}
          />
          {errors.lastName && (
            <p className="text-sm text-red-600 mt-1">
              {errors.lastName.message}
            </p>
          )}
        </div>
      </div>

      {/* Department */}
      <div className="w-full space-y-2">
        <Label
          htmlFor="departmentKey"
          className={`font-semibold ${
            errors.departmentKey ? "text-red-600" : "text-blue-800"
          }`}
        >
          Department *
        </Label>
        <Select
          value={selectedDepartmentKey}
          onValueChange={(value) =>
            setValue("departmentKey", value, { shouldValidate: true })
          }
        >
          <SelectTrigger
            className={`h-11 rounded-xl border ${
              errors.departmentKey
                ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                : "border-blue-200 focus:border-blue-500 focus:ring-blue-500"
            }`}
          >
            <SelectValue placeholder="Select department" />
          </SelectTrigger>
          <SelectContent>
            {DEPARTMENT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.departmentKey && (
          <p className="text-sm text-red-600 mt-1">
            {errors.departmentKey.message}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Designation */}
        <div className="space-y-2">
          <Label
            htmlFor="designation"
            className={`font-semibold flex items-center gap-2 ${
              errors.designation ? "text-red-600" : "text-blue-800"
            }`}
          >
            <BadgeInfo size={16} />
            Designation *
          </Label>
          <Select
            value={selectedDesignation}
            onValueChange={(value) =>
              setValue("designation", value, { shouldValidate: true })
            }
          >
            <SelectTrigger
              className={`h-11 rounded-xl border ${
                errors.designation
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                  : "border-blue-200 focus:border-blue-500 focus:ring-blue-500"
              }`}
            >
              <SelectValue placeholder="Select designation" />
            </SelectTrigger>
            <SelectContent>
              {DESIGNATION_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.designation && (
            <p className="text-sm text-red-600 mt-1">
              {errors.designation.message}
            </p>
          )}
        </div>

        {/* Specialization */}
        <div className="space-y-2">
          <Label
            htmlFor="specialization"
            className="font-semibold text-blue-800"
          >
            Specialization (Optional)
          </Label>
          <Input
            id="specialization"
            placeholder="Networks, Signal Processing, etc."
            {...register("specialization")}
            className="h-11 rounded-xl border border-blue-200 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Submit */}
      <div className="pt-4 flex justify-center">
        <div className="w-3/4 md:w-1/2 lg:w-1/3">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 md:py-4 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-base md:text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Saving profile..." : "Save Teacher Profile"}
          </Button>
        </div>
      </div>
    </form>
  );
};

/* --------------------------------------
   4) Main page: decides which form to show
-------------------------------------- */

const CompleteProfilePage = () => {
  const searchParams = useSearchParams();

  const roleParam = (searchParams.get("role") || "").toLowerCase();
  const emailParam = searchParams.get("email") || "";

  const [role] = useState<"student" | "teacher" | null>(
    roleParam === "student" || roleParam === "teacher"
      ? (roleParam as "student" | "teacher")
      : null
  );

  const email = emailParam;

  const missingRoleOrEmail = !role || !email;

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4 md:p-6">
      <div className="w-full max-w-6xl bg-linear-to-br from-blue-100 via-sky-100 to-indigo-100 rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-3">
          {/* Left decorative panel */}
          <LeftDecorator />

          {/* Right: complete profile form */}
          <div className="p-6 md:p-8 lg:col-span-2">
            {/* Header */}
            <div className="mb-6 md:mb-8 text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start gap-3 mb-3">
                <div className="w-11 h-11 md:w-12 md:h-12 bg-linear-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  {role === "student" ? (
                    <GraduationCap size={22} className="text-white" />
                  ) : (
                    <User size={22} className="text-white" />
                  )}
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold bg-linear-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">
                    Complete Your Profile
                  </h1>
                  <p className="text-gray-600 mt-1 text-sm md:text-base">
                    We need a few more details to set up your{" "}
                    <span className="font-semibold">
                      {role === "teacher"
                        ? "teacher dashboard."
                        : role === "student"
                        ? "student dashboard."
                        : "account."}
                    </span>
                  </p>
                  {email && (
                    <p className="text-xs md:text-sm text-gray-500 mt-1">
                      Logged in as:{" "}
                      <span className="font-mono font-semibold">{email}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Guard: if no role/email provided */}
            {missingRoleOrEmail ? (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-red-200 shadow-sm max-w-lg mx-auto">
                <p className="text-red-600 font-semibold mb-2">
                  Missing information
                </p>
                <p className="text-gray-700 text-sm mb-4">
                  Role or email is missing in the URL. Please:
                </p>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                  <li>Open this page from the login/signup flow directly.</li>
                  <li>
                    Or use a URL like:{" "}
                    <code className="bg-gray-100 px-1 rounded text-xs">
                      /complete-profile?role=student&amp;email=you@wrc.edu.np
                    </code>
                  </li>
                </ul>
              </div>
            ) : (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-blue-200/60 shadow-sm">
                {role === "student" ? (
                  <StudentProfileForm email={email} />
                ) : (
                  <TeacherProfileForm email={email} />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompleteProfilePage;
