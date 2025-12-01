"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, User, Mail, Phone, Lock } from "lucide-react";
import Link from "next/link";

/* ---------------- Constants & Types ---------------- */
const DEPARTMENTS = ["BEI", "BCT", "BEL", "BGE", "BCE", "BME", "BAME"] as const;
const ROLE_VALUES = [
  "admin",
  "adminstaff",
  "teacher",
  "hod",
  "dhod",
  "student",
] as const;
type Role = (typeof ROLE_VALUES)[number];

const ROLE_LIST = [
  { value: "admin", label: "Admin" },
  { value: "adminstaff", label: "Admin Staff" },
  { value: "teacher", label: "Teacher" },
  { value: "hod", label: "HOD" },
  { value: "dhod", label: "DHOD" },
  { value: "student", label: "Student" },
] as const;

const BATCHES = ["2078", "2079", "2080", "2081", "2082"] as const;
const SEMESTERS = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"] as const;

/* ---------------- Regex Patterns ---------------- */
const rollnoRegex = /^wrc0\d{2}(bei|bct|bel|bge|bce|bme|bame)\d{3}$/i;
const emailRegex =
  /^pas0\d{2}(bei|bct|bel|bge|bce|bme|bame)\d{3}@wrc\.edu\.np$/i;
const phoneRegex = /^\d{10}$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

/* ---------------- Zod schema (type-safe) ---------------- */
const RoleEnum = z.enum(ROLE_VALUES);
const DepartmentEnum = z.enum([...DEPARTMENTS] as [string, ...string[]]);
const BatchEnum = z.enum([...BATCHES] as [string, ...string[]]);
const SemesterEnum = z.enum([...SEMESTERS] as [string, ...string[]]);

const signUpFormSchema = z
  .object({
    firstname: z
      .string()
      .min(3, { message: "First name must be at least 3 characters" }),
    middlename: z.string().optional().or(z.literal("")),
    lastname: z
      .string()
      .min(3, { message: "Last name must be at least 3 characters" }),
    gender: z.enum(["male", "female", "not_to_say"]),
    role: z.array(RoleEnum).min(1, { message: "Choose at least one role" }),
    batch: BatchEnum.optional(),
    department: DepartmentEnum.optional(),
    departments: z.array(DepartmentEnum).optional(),
    rollno: z.string().optional(),
    phone: z.string().refine((v) => phoneRegex.test(v), {
      message: "Phone must be 10 digits",
    }),
    email: z
      .string()
      .email({ message: "Invalid email" })
      .refine((v) => emailRegex.test(v), {
        message: "Email must follow pattern: pas078bei023@wrc.edu.np",
      }),
    semester: SemesterEnum.optional(),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" })
      .refine((v) => passwordRegex.test(v), {
        message: "Password must have upper, lower, number and special char",
      }),
    reenterpassword: z.string(),
  })
  .superRefine((data, ctx) => {
    // password match
    if (data.password !== data.reenterpassword) {
      ctx.addIssue({
        path: ["reenterpassword"],
        message: "Passwords do not match",
        code: z.ZodIssueCode.custom,
      });
    }

    const roles = (data.role || []).map((r) => (r as string).toLowerCase());

    // Student cannot be combined with other roles
    if (roles.includes("student") && roles.length > 1) {
      ctx.addIssue({
        path: ["role"],
        message: "Student cannot be combined with other roles",
        code: z.ZodIssueCode.custom,
      });
    }

    // If student -> require batch, department, rollno, semester
    if (roles.includes("student")) {
      if (!data.batch) {
        ctx.addIssue({
          path: ["batch"],
          message: "Batch is required for students",
          code: z.ZodIssueCode.custom,
        });
      }
      if (!data.department) {
        ctx.addIssue({
          path: ["department"],
          message: "Department is required for students",
          code: z.ZodIssueCode.custom,
        });
      }
      if (!data.rollno) {
        ctx.addIssue({
          path: ["rollno"],
          message: "Roll number is required for students",
          code: z.ZodIssueCode.custom,
        });
      }
      if (!data.semester) {
        ctx.addIssue({
          path: ["semester"],
          message: "Semester is required for students",
          code: z.ZodIssueCode.custom,
        });
      }
      if (data.rollno && !rollnoRegex.test(data.rollno)) {
        ctx.addIssue({
          path: ["rollno"],
          message: "Roll number must match pattern like wrc078bei023",
          code: z.ZodIssueCode.custom,
        });
      }
    }

    // Teaching roles require departments
    const teachingRoles = ["teacher", "hod", "dhod"];
    const hasTeaching = roles.some((r) => teachingRoles.includes(r));
    if (hasTeaching) {
      if (!data.departments || data.departments.length === 0) {
        ctx.addIssue({
          path: ["departments"],
          message: "At least one department is required for teaching roles",
          code: z.ZodIssueCode.custom,
        });
      }
    }

    // NOTE: We do NOT force HOD/DHOD to include 'teacher' role (per your requirement).
    // NOTE: We do NOT treat admin/adminstaff presence of department as validation error;
    // component will auto-assign Administration on submit if appropriate.
  });

type SignUpFormType = z.infer<typeof signUpFormSchema>;

/* ---------------- Component ---------------- */
export default function SignUp() {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormType>({
    resolver: zodResolver(signUpFormSchema),
    defaultValues: {
      role: [] as Role[],
      departments: [] as (typeof DEPARTMENTS)[number][],
    },
  });

  const selectedRoles = watch("role") || [];
  const passwordValue = watch("password") || "";
  const selectedDepartments = watch("departments") || [];

  const [showPassword, setShowPassword] = useState(false);
  const [showReenter, setShowReenter] = useState(false);

  /* password requirement checks (for UI) */
  const checks = {
    length: passwordValue.length >= 8,
    upper: /[A-Z]/.test(passwordValue),
    lower: /[a-z]/.test(passwordValue),
    digit: /[0-9]/.test(passwordValue),
    special: /[^A-Za-z0-9]/.test(passwordValue),
  };

  /* ---------- Role selection logic (enforces your rules) ---------- */
  const handleRoleChange = (roleValue: Role, checked: boolean) => {
    const current = new Set<string>(selectedRoles ?? []);
    const val = roleValue.toLowerCase();

    if (checked) {
      if (val === "student") {
        // selecting student clears everything else
        current.clear();
        current.add("student");
      } else if (val === "admin") {
        // admin cannot co-exist with student, hod, dhod, adminstaff
        current.delete("student");
        current.delete("hod");
        current.delete("dhod");
        current.delete("adminstaff");
        current.add("admin");
      } else if (val === "adminstaff") {
        // adminstaff cannot co-exist with student, hod, dhod, admin
        current.delete("student");
        current.delete("hod");
        current.delete("dhod");
        current.delete("admin");
        current.add("adminstaff");
      } else if (val === "hod") {
        // hod cannot co-exist with student, dhod, admin, adminstaff
        current.delete("student");
        current.delete("dhod");
        current.delete("admin");
        current.delete("adminstaff");
        current.add("hod");
      } else if (val === "dhod") {
        // dhod cannot co-exist with student, hod, admin, adminstaff
        current.delete("student");
        current.delete("hod");
        current.delete("admin");
        current.delete("adminstaff");
        current.add("dhod");
      } else if (val === "teacher") {
        // teacher cannot co-exist with student, but can co-exist with admin/hod/dhod/adminstaff
        current.delete("student");
        current.add("teacher");
      } else {
        // fallback: remove student if it was present and add new
        current.delete("student");
        current.add(val);
      }
    } else {
      // unchecked -> remove the role
      current.delete(val);
    }

    const newRoles = Array.from(current) as Role[];
    setValue("role", newRoles);
    // re-validate the dependent fields immediately
    trigger(["role", "batch", "department", "departments", "semester"]);
  };

  /* ---------- Department multiselect handler for teachers ---------- */
  const handleDepartmentChange = (
    dept: (typeof DEPARTMENTS)[number],
    checked: boolean
  ) => {
    const current = new Set(selectedDepartments ?? []);
    if (checked) current.add(dept);
    else current.delete(dept);
    setValue("departments", Array.from(current) as any);
    trigger("departments");
  };

  /* ---------- Submit handler ---------- */
  const onSubmit = async (values: SignUpFormType) => {
    // auto-assign 'Administration' department if admin/adminstaff selected
    const rolesLower = (values.role || []).map((r) =>
      (r as string).toLowerCase()
    );
    const payload = {
      ...values,
      department:
        rolesLower.includes("admin") || rolesLower.includes("adminstaff")
          ? "Administration"
          : values.department,
    };

    console.log("Signup payload:", payload);

    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: "Server error" }));
        throw new Error(err.message || "Signup failed");
      }

      alert("Account created successfully");
    } catch (e: any) {
      alert(e.message || "An error occurred");
    }
  };

  /* derived booleans for conditional UI */
  const isStudent = selectedRoles.some((r) => r.toLowerCase() === "student");
  const isTeachingRole = selectedRoles.some((r) =>
    ["teacher", "hod", "dhod"].includes(r.toLowerCase())
  );
  const isAdminRole = selectedRoles.some((r) =>
    ["admin", "adminstaff"].includes(r.toLowerCase())
  );

  /* ---------------- JSX UI ---------------- */
  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4 md:p-6">
      <div className="w-full max-w-6xl bg-linear-to-br from-blue-100 via-sky-100 to-indigo-100 rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-3">
          {/* Left decorative panel - Updated with proper logo and text alignment */}
          <div className="hidden lg:flex flex-col justify-center items-center p-8 bg-linear-to-b from-blue-800 to-indigo-900 text-white lg:col-span-1">
            <div className="w-full space-y-8">
              {/* Logo Container */}
              <div className="flex flex-col items-center">
                <div className="relative w-48 h-48 mb-6">
                  <div className="absolute inset-0 bg-linear-to-br from-white/20 to-transparent rounded-full blur-xl"></div>
                  <div className="relative w-full h-full rounded-full border-4 border-white/30 bg-white/10 backdrop-blur-sm p-3 shadow-2xl">
                    <div className="w-full h-full rounded-full overflow-hidden border-2 border-white/40 bg-white">
                      <Image
                        src="/wrc-logo.png"
                        alt="WRC logo"
                        width={212}
                        height={238}
                        className="w-full h-full object-contain p-4"
                      />
                    </div>
                  </div>
                </div>

                {/* University Text */}
                <div className="text-center space-y-4">
                  <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-wide text-white drop-shadow-lg">
                      Tribhuvan University
                    </h1>
                    <div className="h-1 w-24 bg-linear-to-r from-transparent via-white/50 to-transparent mx-auto"></div>
                  </div>

                  <h2 className="text-2xl font-semibold text-blue-100">
                    Institute of Engineering
                  </h2>

                  <h3 className="text-2xl font-bold text-white bg-linear-to-r from-transparent via-white/20 to-transparent py-2 px-6 rounded-lg">
                    PASHCHIMANCHAL CAMPUS
                  </h3>

                  <div className="pt-4">
                    <p className="text-blue-200 text-sm italic">
                      Western Regional Campus
                    </p>
                    <p className="text-blue-200/80 text-xs mt-1">
                      लामाचाँग, पोखरा
                    </p>
                  </div>
                </div>
              </div>

              {/* Decorative Elements */}
              <div className="mt-8">
                <div className="flex justify-center space-x-2">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full bg-white/30 ${
                        i === 2 ? "bg-white/70" : ""
                      }`}
                    ></div>
                  ))}
                </div>
                <p className="text-center text-white/70 text-sm mt-4 italic">
                  Creating futures through education
                </p>
              </div>
            </div>
          </div>

          {/* Form section */}
          <div className="p-6 md:p-8 lg:col-span-2">
            <div className="mb-8 text-center lg:text-left">
              <h1 className="text-4xl font-bold bg-linear-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">
                Create Account
              </h1>
              <p className="text-gray-600 mt-2">
                Register to access the campus management system
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Name Section */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-blue-200/60 shadow-sm">
                <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center gap-2">
                  <User size={18} />
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label
                      htmlFor="firstname"
                      className="text-blue-700 font-medium"
                    >
                      First name *
                    </Label>
                    <Input
                      id="firstname"
                      placeholder="First name"
                      {...register("firstname")}
                      className="mt-1.5 border-blue-200 focus:border-blue-500 focus:ring-blue-500 h-11 rounded-lg"
                    />
                    {errors.firstname && (
                      <p className="text-sm text-red-600 mt-1">
                        {errors.firstname.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label
                      htmlFor="middlename"
                      className="text-blue-700 font-medium"
                    >
                      Middle name
                    </Label>
                    <Input
                      id="middlename"
                      placeholder="Middle name (optional)"
                      {...register("middlename")}
                      className="mt-1.5 border-blue-200 focus:border-blue-500 focus:ring-blue-500 h-11 rounded-lg"
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="lastname"
                      className="text-blue-700 font-medium"
                    >
                      Last name *
                    </Label>
                    <Input
                      id="lastname"
                      placeholder="Last name"
                      {...register("lastname")}
                      className="mt-1.5 border-blue-200 focus:border-blue-500 focus:ring-blue-500 h-11 rounded-lg"
                    />
                    {errors.lastname && (
                      <p className="text-sm text-red-600 mt-1">
                        {errors.lastname.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Gender */}
                <div className="mt-6">
                  <Label className="text-blue-700 font-medium">Gender *</Label>
                  <div className="flex flex-wrap gap-3 mt-2">
                    {[
                      { value: "male", label: "Male" },
                      { value: "female", label: "Female" },
                      { value: "not_to_say", label: "Not to say" },
                    ].map(({ value, label }) => {
                      const isSelected = watch("gender") === value;
                      return (
                        <label
                          key={value}
                          className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                            isSelected
                              ? "border-blue-600 bg-blue-50 shadow-md shadow-blue-100"
                              : "border-gray-200 hover:border-blue-300 hover:bg-blue-50/50"
                          }`}
                        >
                          <div className="relative flex items-center justify-center">
                            <input
                              type="radio"
                              value={value}
                              {...register("gender")}
                              className="sr-only"
                            />
                            <div className="flex items-center justify-center">
                              <div
                                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                                  isSelected
                                    ? "border-blue-600 bg-blue-600"
                                    : "border-blue-400"
                                }`}
                              >
                                {isSelected && (
                                  <div className="w-2 h-2 rounded-full bg-white"></div>
                                )}
                              </div>
                            </div>
                          </div>
                          <span className="font-medium text-gray-700">
                            {label}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                  {errors.gender && (
                    <p className="text-sm text-red-600 mt-1">
                      {errors.gender.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Role Section */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-blue-200/60 shadow-sm">
                <h3 className="text-lg font-semibold text-blue-800 mb-4">
                  Select Role(s) *
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {ROLE_LIST.map(({ value, label }) => (
                    <label
                      key={value}
                      className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                        selectedRoles.includes(value)
                          ? "border-blue-600 bg-blue-50 shadow-md shadow-blue-100"
                          : "border-gray-200 hover:border-blue-300 hover:bg-blue-50/50"
                      }`}
                    >
                      <div className="relative">
                        <Checkbox
                          checked={selectedRoles.includes(value)}
                          onCheckedChange={(checked) =>
                            handleRoleChange(value as Role, checked as boolean)
                          }
                          className="border-2 border-blue-400 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 w-5 h-5"
                        />
                      </div>
                      <span className="font-medium text-gray-700">{label}</span>
                    </label>
                  ))}
                </div>
                {errors.role && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.role.message}
                  </p>
                )}
              </div>

              {/* Student-specific fields */}
              {isStudent && (
                <div className="bg-linear-to-r from-blue-50/80 to-indigo-50/80 backdrop-blur-sm rounded-2xl p-6 border border-blue-200 shadow-sm">
                  <h3 className="text-lg font-semibold text-blue-800 mb-4">
                    Student Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-blue-700 font-medium">
                        Batch *
                      </Label>
                      <Select
                        onValueChange={(val) => setValue("batch", val as any)}
                      >
                        <SelectTrigger className="mt-1.5 border-blue-200 focus:border-blue-500 focus:ring-blue-500 h-11 rounded-lg">
                          <SelectValue placeholder="Select batch" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Batch</SelectLabel>
                            {BATCHES.map((b) => (
                              <SelectItem key={b} value={b}>
                                {b}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      {errors.batch && (
                        <p className="text-sm text-red-600 mt-1">
                          {errors.batch.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label className="text-blue-700 font-medium">
                        Department *
                      </Label>
                      <Select
                        onValueChange={(val) =>
                          setValue("department", val as any)
                        }
                      >
                        <SelectTrigger className="mt-1.5 border-blue-200 focus:border-blue-500 focus:ring-blue-500 h-11 rounded-lg">
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Departments</SelectLabel>
                            {DEPARTMENTS.map((d) => (
                              <SelectItem key={d} value={d}>
                                {d}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      {errors.department && (
                        <p className="text-sm text-red-600 mt-1">
                          {errors.department.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label
                        htmlFor="rollno"
                        className="text-blue-700 font-medium"
                      >
                        Roll Number *
                      </Label>
                      <Input
                        id="rollno"
                        placeholder="wrc078bei023"
                        {...register("rollno")}
                        className="mt-1.5 border-blue-200 focus:border-blue-500 focus:ring-blue-500 h-11 rounded-lg"
                      />
                      {errors.rollno && (
                        <p className="text-sm text-red-600 mt-1">
                          {errors.rollno.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label className="text-blue-700 font-medium">
                        Semester *
                      </Label>
                      <Select
                        onValueChange={(val) =>
                          setValue("semester", val as any)
                        }
                      >
                        <SelectTrigger className="mt-1.5 border-blue-200 focus:border-blue-500 focus:ring-blue-500 h-11 rounded-lg">
                          <SelectValue placeholder="Select semester" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Semester</SelectLabel>
                            {SEMESTERS.map((s) => (
                              <SelectItem key={s} value={s}>
                                {s}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      {errors.semester && (
                        <p className="text-sm text-red-600 mt-1">
                          {errors.semester.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Teacher/HOD/DHOD Department Selection */}
              {isTeachingRole && (
                <div className="bg-linear-to-r from-blue-50/80 to-indigo-50/80 backdrop-blur-sm rounded-2xl p-6 border border-blue-200 shadow-sm">
                  <h3 className="text-lg font-semibold text-blue-800 mb-4">
                    Select Department(s) *
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    You can teach in multiple departments
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {DEPARTMENTS.map((dept) => (
                      <label
                        key={dept}
                        className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                          selectedDepartments.includes(dept)
                            ? "border-blue-600 bg-blue-50 shadow-md shadow-blue-100"
                            : "border-gray-200 hover:border-blue-300 hover:bg-blue-50/50"
                        }`}
                      >
                        <Checkbox
                          checked={selectedDepartments.includes(dept)}
                          onCheckedChange={(checked) =>
                            handleDepartmentChange(dept, checked as boolean)
                          }
                          className="border-2 border-blue-400 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 w-5 h-5"
                        />
                        <span className="font-medium text-gray-700">
                          {dept}
                        </span>
                      </label>
                    ))}
                  </div>
                  {errors.departments && (
                    <p className="text-sm text-red-600 mt-1">
                      {errors.departments.message}
                    </p>
                  )}
                </div>
              )}

              {/* Admin/Admin Staff Department Info */}
              {isAdminRole && (
                <div className="bg-linear-to-r from-blue-50/80 to-indigo-50/80 backdrop-blur-sm rounded-2xl p-6 border border-blue-200 shadow-sm">
                  <div className="flex items-center gap-4 p-4 bg-blue-100/60 rounded-xl">
                    <div className="w-10 h-10 bg-linear-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center shrink-0">
                      <User size={18} className="text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-blue-800">
                        Administration Department
                      </h4>
                      <p className="text-sm text-gray-600">
                        Admin roles are automatically assigned to the
                        Administration department
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Contact Information */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-blue-200/60 shadow-sm">
                <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center gap-2">
                  <Mail size={18} />
                  Contact Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label
                      htmlFor="phone"
                      className="text-blue-700 font-medium flex items-center gap-2"
                    >
                      <Phone size={14} />
                      Phone *
                    </Label>
                    <Input
                      id="phone"
                      placeholder="98XXXXXXXX"
                      {...register("phone")}
                      className="mt-1.5 border-blue-200 focus:border-blue-500 focus:ring-blue-500 h-11 rounded-lg"
                    />
                    {errors.phone && (
                      <p className="text-sm text-red-600 mt-1">
                        {errors.phone.message}
                      </p>
                    )}
                  </div>

                  <div className="md:col-span-1">
                    <Label
                      htmlFor="email"
                      className="text-blue-700 font-medium"
                    >
                      Email *
                    </Label>
                    <Input
                      id="email"
                      placeholder="pas078bei023@wrc.edu.np"
                      {...register("email")}
                      className="mt-1.5 border-blue-200 focus:border-blue-500 focus:ring-blue-500 h-11 rounded-lg"
                    />
                    {errors.email && (
                      <p className="text-sm text-red-600 mt-1">
                        {errors.email.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Password Section */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-blue-200/60 shadow-sm">
                <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center gap-2">
                  <Lock size={18} />
                  Security
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Password */}
                  <div>
                    <Label
                      htmlFor="password"
                      className="text-blue-700 font-medium"
                    >
                      Password *
                    </Label>
                    <div className="relative mt-1.5">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a strong password"
                        {...register("password")}
                        className="pr-12 border-blue-200 focus:border-blue-500 focus:ring-blue-500 h-11 rounded-lg"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-600"
                        onClick={() => setShowPassword((s) => !s)}
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                      >
                        {showPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-sm text-red-600 mt-1">
                        {errors.password.message}
                      </p>
                    )}
                  </div>

                  {/* Re-enter Password */}
                  <div>
                    <Label
                      htmlFor="reenterpassword"
                      className="text-blue-700 font-medium"
                    >
                      Confirm Password *
                    </Label>
                    <div className="relative mt-1.5">
                      <Input
                        id="reenterpassword"
                        type={showReenter ? "text" : "password"}
                        placeholder="Re-enter your password"
                        {...register("reenterpassword")}
                        className="pr-12 border-blue-200 focus:border-blue-500 focus:ring-blue-500 h-11 rounded-lg"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-600"
                        onClick={() => setShowReenter((s) => !s)}
                        aria-label={
                          showReenter ? "Hide password" : "Show password"
                        }
                      >
                        {showReenter ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {errors.reenterpassword && (
                      <p className="text-sm text-red-600 mt-1">
                        {errors.reenterpassword.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Password Requirements */}
                <div className="mt-6 p-5 bg-linear-to-r from-blue-50 to-blue-100/60 rounded-xl border border-blue-200">
                  <h4 className="font-medium text-blue-800 mb-3">
                    Password Requirements:
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <div
                      className={`flex items-center gap-3 p-3 rounded-lg ${
                        checks.length
                          ? "bg-green-50/80 text-green-700 border border-green-200"
                          : "bg-gray-50/80 text-gray-600 border border-gray-200"
                      }`}
                    >
                      <div
                        className={`w-3 h-3 rounded-full ${
                          checks.length ? "bg-green-500" : "bg-gray-400"
                        }`}
                      ></div>
                      <span className="text-sm font-medium">8+ characters</span>
                    </div>
                    <div
                      className={`flex items-center gap-3 p-3 rounded-lg ${
                        checks.upper
                          ? "bg-green-50/80 text-green-700 border border-green-200"
                          : "bg-gray-50/80 text-gray-600 border border-gray-200"
                      }`}
                    >
                      <div
                        className={`w-3 h-3 rounded-full ${
                          checks.upper ? "bg-green-500" : "bg-gray-400"
                        }`}
                      ></div>
                      <span className="text-sm font-medium">
                        Uppercase letter
                      </span>
                    </div>
                    <div
                      className={`flex items-center gap-3 p-3 rounded-lg ${
                        checks.lower
                          ? "bg-green-50/80 text-green-700 border border-green-200"
                          : "bg-gray-50/80 text-gray-600 border border-gray-200"
                      }`}
                    >
                      <div
                        className={`w-3 h-3 rounded-full ${
                          checks.lower ? "bg-green-500" : "bg-gray-400"
                        }`}
                      ></div>
                      <span className="text-sm font-medium">
                        Lowercase letter
                      </span>
                    </div>
                    <div
                      className={`flex items-center gap-3 p-3 rounded-lg ${
                        checks.digit
                          ? "bg-green-50/80 text-green-700 border border-green-200"
                          : "bg-gray-50/80 text-gray-600 border border-gray-200"
                      }`}
                    >
                      <div
                        className={`w-3 h-3 rounded-full ${
                          checks.digit ? "bg-green-500" : "bg-gray-400"
                        }`}
                      ></div>
                      <span className="text-sm font-medium">Number</span>
                    </div>
                    <div
                      className={`flex items-center gap-3 p-3 rounded-lg ${
                        checks.special
                          ? "bg-green-50/80 text-green-700 border border-green-200"
                          : "bg-gray-50/80 text-gray-600 border border-gray-200"
                      }`}
                    >
                      <div
                        className={`w-3 h-3 rounded-full ${
                          checks.special ? "bg-green-500" : "bg-gray-400"
                        }`}
                      ></div>
                      <span className="text-sm font-medium">
                        Special character
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-7 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-lg"
                >
                  {isSubmitting ? (
                    <>
                      <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></span>
                      Creating Account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </Button>
                <p className="text-center text-gray-500 text-sm mt-4">
                  Already have an account?{" "}
                  <Link
                    href={"/login"}
                    className="text-blue-600 font-medium hover:underline"
                  >
                    {" "}
                    Sign in here{" "}
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
