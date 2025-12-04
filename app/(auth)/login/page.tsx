// app /(auth)/login/page.tsx 

"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Eye, EyeOff, Mail, Lock} from "lucide-react";
import Link from "next/link";
import LeftDecorator from "@/components/sidebar/LeftDecorator";

/* ---------------- Zod schema ---------------- */
const loginFormSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(1, { message: "Password is required" })
    .min(8, { message: "Password must be at least 8 characters" }),
});

type LoginFormType = z.infer<typeof loginFormSchema>;

/**
 * Renders the Campus Login page with email and password fields, client-side validation, and submission handling.
 *
 * The component uses React Hook Form with a Zod schema to validate inputs, provides a show/hide password toggle,
 * a "Remember me" checkbox, and submits credentials to the /api/login endpoint, showing success or error alerts.
 *
 * @returns The login page UI as a React element.
 */
export default function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormType>({
    resolver: zodResolver(loginFormSchema),
  });

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  /* ---------- Submit handler ---------- */
  const onSubmit = async (values: LoginFormType) => {
    console.log("Login attempt:", values);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: "Server error" }));
        throw new Error(err.message || "Login failed");
      }

      const data = await res.json();
      alert("Login successful!");
      // In real app, you would redirect or set auth state here
      // router.push("/dashboard");
    } catch (e: any) {
      alert(e.message || "Invalid credentials. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4 md:p-6">
      <div className="w-full max-w-6xl bg-linear-to-br from-blue-100 via-sky-100 to-indigo-100 rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-3">
          {/* Left decorative panel - Matching signup theme */}
          <LeftDecorator />

          {/* Login Form section */}
          <div className="p-6 md:p-8 lg:col-span-2">
            <div className="mb-8 text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start gap-3 mb-4">
                <div>
                  <h1 className="text-4xl font-bold bg-linear-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">
                    Campus Login
                  </h1>
                </div>
              </div>

              {/* Quick Info Cards */}
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-blue-200/60 shadow-sm">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Email Field */}
                <div className="space-y-3">
                  <Label
                    htmlFor="email"
                    className="text-blue-800 font-semibold flex items-center gap-2"
                  >
                    <Mail size={16} />
                    Campus Email Address *
                  </Label>
                  <div className="relative">
                    <Input
                      id="email"
                      type="email"
                      placeholder="pas078bei023@wrc.edu.np"
                      {...register("email")}
                      className="pl-12 border-blue-200 focus:border-blue-500 focus:ring-blue-500 h-12 rounded-xl text-lg"
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                      <Mail size={20} />
                    </div>
                  </div>
                  {errors.email && (
                    <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Password Field */}
                <div className="space-y-3">
                  <Label
                    htmlFor="password"
                    className="text-blue-800 font-semibold flex items-center gap-2"
                  >
                    <Lock size={16} />
                    Password *
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      {...register("password")}
                      className="pl-12 pr-12 border-blue-200 focus:border-blue-500 focus:ring-blue-500 h-12 rounded-xl text-lg"
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                      <Lock size={20} />
                    </div>
                    <button
                      type="button"
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-600 transition-colors"
                      onClick={() => setShowPassword((s) => !s)}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                      {errors.password.message}
                    </p>
                  )}
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="sr-only"
                      />
                      <div
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 group-hover:border-blue-400 ${
                          rememberMe
                            ? "bg-blue-600 border-blue-600"
                            : "border-blue-300"
                        }`}
                      >
                        {rememberMe && (
                          <svg
                            className="w-3 h-3 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="3"
                              d="M5 13l4 4L19 7"
                            ></path>
                          </svg>
                        )}
                      </div>
                    </div>
                    <span className="text-gray-700 font-medium group-hover:text-blue-700 transition-colors">
                      Remember me
                    </span>
                  </label>

                  <a
                    href="#"
                    className="text-blue-600 font-semibold hover:text-blue-800 transition-colors text-sm flex items-center gap-1"
                  >
                    <span>Forgot password?</span>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M17 8l4 4m0 0l-4 4m4-4H3"
                      ></path>
                    </svg>
                  </a>
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-6 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-lg"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></span>
                        Signing In...
                      </>
                    ) : (
                      <>
                        <Lock size={18} className="mr-2" />
                        Sign In to Account
                      </>
                    )}
                  </Button>
                </div>

                {/* Sign Up Link */}
                <div className="pt-6 text-center">
                  <p className="text-gray-600">
                    Don&apos;t have an account?{" "}
                    <Link
                      href="/signup"
                      className="text-blue-600 font-semibold hover:text-blue-800 hover:underline transition-colors"
                    >
                      Create new account
                    </Link>
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Need help?{" "}
                    <a href="#" className="text-blue-500 hover:underline">
                      Contact campus support
                    </a>
                  </p>
                </div>
              </form>
            </div>

            {/* Footer Note */}
            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">
                By signing in, you agree to our{" "}
                <a href="#" className="text-blue-500 hover:underline">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="text-blue-500 hover:underline">
                  Privacy Policy
                </a>
              </p>
              <p className="text-xs text-gray-400 mt-2">
                © {new Date().getFullYear()} Tribhuvan University,
                Pashchimanchal Campus. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}