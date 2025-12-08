// app/(app)/signup/page.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eye, EyeOff, Mail, Phone, User } from "lucide-react";
import Link from "next/link";
import LeftDecorator from "@/components/sidebar/LeftDecorator";
import { toast } from "sonner";

/* ---------------- Constants & Types ---------------- */

const ROLE_VALUES = ["student", "teacher"] as const;
type Role = (typeof ROLE_VALUES)[number];

const ROLE_LIST = [
  { value: "student", label: "Student" },
  { value: "teacher", label: "Teacher" },
] as const;

/* ---------------- Regex Patterns ---------------- */

// const emailRegex =
// /^pas0\d{2}(bei|bct|bel|bge|bce|bme|bame)\d{3}@wrc\.edu\.np$/i;
const emailRegex = /^[\p{L}0-9._%+-]{1,64}@[\p{L}0-9.-]{1,255}\.[\p{L}]{2,}$/u;
const phoneRegex = /^\d{10}$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

/* ---------------- Zod schema (type-safe) ---------------- */

const RoleEnum = z.enum(ROLE_VALUES);

const signUpFormSchema = z
  .object({
    role: RoleEnum,
    phone: z.string().refine((v) => phoneRegex.test(v), {
      message: "Phone must be 10 digits",
    }),
    email: z
      .string()
      .email({ message: "Invalid email" })
      .refine((v) => emailRegex.test(v), {
        message: "Email must follow pattern: pas078bei023@wrc.edu.np",
      }),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" })
      .refine((v) => passwordRegex.test(v), {
        message: "Password must have upper, lower, number and special char",
      }),
    reenterpassword: z.string(),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.reenterpassword) {
      ctx.addIssue({
        path: ["reenterpassword"],
        message: "Passwords do not match",
        code: z.ZodIssueCode.custom,
      });
    }
  });

type SignUpFormType = z.infer<typeof signUpFormSchema>;

/* ---------------- Component ---------------- */

const SignUp = () => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormType>({
    resolver: zodResolver(signUpFormSchema),
    mode: "onBlur",
  });
  const router = useRouter();
  const selectedRole = watch("role");
  const passwordValue = watch("password") || "";

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

  /* ---------- Submit handler ---------- */
  const onSubmit = async (values: SignUpFormType) => {
    const payload = { ...values };

    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({} as unknown));
      //  console.log("Signup response:", data);

      if (!res.ok) {
        // backend error (4xx / 5xx)
        if (res.status === 409) {
          toast.warning("Email already registered,please login", {
            style: {
              backgroundColor: "#fef3c7",
              color: "#92400e",
              border: "1px solid #f59e0b",
              borderRadius: "50px",
              fontSize: "14px",
            },
          });
        }

        // alert( data.message ||"Signup failed");
        return;
      }

      // success case (201 or 200 from backend)
      // data.message
      // alert(data.message || "Account created successfully");

      // if backend told us where to go, navigate there
      if (data.redirectTo) {
        router.push(data.redirectTo);
      }
    } catch (e: unknown) {
      if (e instanceof Error) {
        console.log(e.message);
        alert(e.message);
      } else {
        console.log("An error occurred");
        alert("An error occurred");
      }
    }
  };

  /* ---------------- JSX UI ---------------- */

  return (
    <div className="min-h-screen max-h-screen bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-2 md:p-4 overflow-hidden">
      <div className="w-full max-w-6xl h-[95vh] bg-linear-to-br from-blue-100 via-sky-100 to-indigo-100 rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-3 h-full">
          {/* Left decorative panel */}
          <LeftDecorator />

          {/* Form section */}
          <div className="lg:col-span-2 h-full overflow-y-auto p-4 md:p-6 lg:p-8">
            <div className="mb-4">
              <h1 className="text-3xl md:text-4xl font-bold bg-linear-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">
                Create Account
              </h1>
              <p className="text-gray-600 mt-2 text-sm md:text-base">
                Register to access the campus attendance system
              </p>
            </div>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-4 md:space-y-6"
            >
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 md:p-6 border border-blue-200/60 shadow-sm space-y-4 md:space-y-6">
                {/* Email */}
                <div>
                  <Label
                    htmlFor="email"
                    className={`font-medium flex items-center gap-2 ${
                      errors.email ? "text-red-600" : "text-blue-700"
                    }`}
                  >
                    <Mail size={15} />
                    Email *
                  </Label>
                  <Input
                    id="email"
                    placeholder="pas078bei023@wrc.edu.np"
                    {...register("email")}
                    className={`mt-1.5 h-11 rounded-lg border ${
                      errors.email
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                        : "border-blue-200 focus:border-blue-500 focus:ring-blue-500"
                    }`}
                  />
                </div>

                {/* Phone and Role in grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  {/* Phone */}
                  <div>
                    <Label
                      htmlFor="phone"
                      className={`font-medium flex items-center gap-2 ${
                        errors.phone ? "text-red-600" : "text-blue-700"
                      }`}
                    >
                      <Phone size={14} />
                      Phone *
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      maxLength={10}
                      placeholder="98XXXXXXXX"
                      {...register("phone")}
                      className={`mt-1.5 h-11 rounded-lg border ${
                        errors.phone
                          ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                          : "border-blue-200 focus:border-blue-500 focus:ring-blue-500"
                      }`}
                    />
                  </div>

                  {/* Role Section - Dropdown for Student/Teacher */}
                  <div>
                    <Label
                      htmlFor="role-select"
                      className={`font-medium flex items-center gap-2 ${
                        errors.role ? "text-red-600" : "text-blue-700"
                      }`}
                    >
                      <User size={15} />I am a *
                    </Label>
                    <Select
                      value={selectedRole}
                      onValueChange={(value) => {
                        setValue("role", value as Role);
                      }}
                    >
                      <SelectTrigger
                        id="role-select"
                        className={`w-full mt-1.5 h-11 rounded-lg border ${
                          errors.role
                            ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                            : "border-blue-200 focus:border-blue-500 focus:ring-blue-500"
                        }`}
                      >
                        <SelectValue placeholder="Select your role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Select Role</SelectLabel>
                          {ROLE_LIST.map((role) => (
                            <SelectItem key={role.value} value={role.value}>
                              {role.label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Password and Confirm Password in grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  {/* Password */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="password"
                      className={`font-medium ${
                        errors.password ? "text-red-600" : "text-blue-700"
                      }`}
                    >
                      Password *
                    </Label>
                    <div className="relative mt-1.5">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a strong password"
                        {...register("password")}
                        className={`pr-12 h-11 rounded-lg border ${
                          errors.password
                            ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                            : "border-blue-200 focus:border-blue-500 focus:ring-blue-500"
                        }`}
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

                    {/* Password Requirements */}
                    <div className="space-y-1 pt-1">
                      <div
                        className={`flex items-center ${
                          checks.length ? "text-green-600" : "text-red-500"
                        } text-xs`}
                      >
                        <div
                          className={`w-2 h-2 rounded-full mr-1.5 shrink-0 ${
                            checks.length ? "bg-green-500" : "bg-red-400"
                          }`}
                        ></div>
                        <span>At least 8 characters</span>
                      </div>

                      <div
                        className={`flex items-center ${
                          checks.upper ? "text-green-600" : "text-red-500"
                        } text-xs`}
                      >
                        <div
                          className={`w-2 h-2 rounded-full mr-1.5 shrink-0 ${
                            checks.upper ? "bg-green-500" : "bg-red-400"
                          }`}
                        ></div>
                        <span>One uppercase letter</span>
                      </div>

                      <div
                        className={`flex items-center ${
                          checks.lower ? "text-green-600" : "text-red-500"
                        } text-xs`}
                      >
                        <div
                          className={`w-2 h-2 rounded-full mr-1.5 shrink-0 ${
                            checks.lower ? "bg-green-500" : "bg-red-400"
                          }`}
                        ></div>
                        <span>One lowercase letter</span>
                      </div>

                      <div
                        className={`flex items-center ${
                          checks.digit ? "text-green-600" : "text-red-500"
                        } text-xs`}
                      >
                        <div
                          className={`w-2 h-2 rounded-full mr-1.5 shrink-0 ${
                            checks.digit ? "bg-green-500" : "bg-red-400"
                          }`}
                        ></div>
                        <span>One number</span>
                      </div>

                      <div
                        className={`flex items-center ${
                          checks.special ? "text-green-600" : "text-red-500"
                        } text-xs`}
                      >
                        <div
                          className={`w-2 h-2 rounded-full mr-1.5 shrink-0 ${
                            checks.special ? "bg-green-500" : "bg-red-400"
                          }`}
                        ></div>
                        <span>One special character</span>
                      </div>
                    </div>
                  </div>

                  {/* Re-enter Password */}
                  <div>
                    <Label
                      htmlFor="reenterpassword"
                      className={`font-medium ${
                        errors.reenterpassword
                          ? "text-red-600"
                          : "text-blue-700"
                      }`}
                    >
                      Confirm Password *
                    </Label>
                    <div className="relative mt-1.5">
                      <Input
                        id="reenterpassword"
                        type={showReenter ? "text" : "password"}
                        placeholder="Re-enter your password"
                        {...register("reenterpassword")}
                        className={`pr-12 h-11 rounded-lg border ${
                          errors.reenterpassword
                            ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                            : "border-blue-200 focus:border-blue-500 focus:ring-blue-500"
                        }`}
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
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2 md:pt-4">
                <div className="w-full flex justify-center items-center">
                  <div className="w-1/4 min-w-[180px]">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-6 md:py-7 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-base md:text-lg"
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
                  </div>
                </div>
                <p className="text-center text-gray-500 text-sm mt-3 md:mt-4">
                  Already have an account?{" "}
                  <Link
                    href={"/login"}
                    className="text-blue-600 font-medium hover:underline"
                  >
                    Sign in here
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
