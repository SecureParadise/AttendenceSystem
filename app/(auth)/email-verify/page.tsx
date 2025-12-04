"use client";

import React, { useState, useRef, useEffect, KeyboardEvent } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Mail,
  Lock,
  Clock,
  RefreshCw,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import LeftDecorator from "@/components/sidebar/LeftDecorator";


/* ---------------- Zod schema ---------------- */
const otpFormSchema = z.object({
  otp: z
    .string()
    .length(6, { message: "OTP must be exactly 6 digits" })
    .regex(/^\d+$/, { message: "OTP must contain only numbers" }),
});

type OtpFormType = z.infer<typeof otpFormSchema>;

/* ---------------- Component ---------------- */
export default function EmailVerification() {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<OtpFormType>({
    resolver: zodResolver(otpFormSchema),
  });

  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [canResend, setCanResend] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const userEmail = "user@example.com"; // Replace with actual email from context/auth

  /* ---------- Timer for OTP expiration ---------- */
  useEffect(() => {
    if (timeLeft <= 0) {
      setCanResend(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  /* ---------- Format time display ---------- */
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  /* ---------- Handle OTP input change ---------- */
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return; // Only allow single digit

    const newOtpDigits = [...otpDigits];
    newOtpDigits[index] = value;
    setOtpDigits(newOtpDigits);

    // Update form value
    setValue("otp", newOtpDigits.join(""), { shouldValidate: true });

    // Auto-focus next input
    if (value !== "" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  /* ---------- Handle backspace ---------- */
  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && otpDigits[index] === "" && index > 0) {
      // Move focus to previous input on backspace
      inputRefs.current[index - 1]?.focus();
    }
  };

  /* ---------- Handle paste ---------- */
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();

    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split("");
      const newOtpDigits = [...otpDigits];

      digits.slice(0, 6).forEach((digit, index) => {
        newOtpDigits[index] = digit;
      });

      setOtpDigits(newOtpDigits);
      setValue("otp", newOtpDigits.join(""), { shouldValidate: true });

      // Focus last input
      inputRefs.current[5]?.focus();
    }
  };

  /* ---------- Resend OTP ---------- */
  const handleResendOtp = async () => {
    if (!canResend) return;

    setIsResending(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Reset timer and OTP
      setTimeLeft(300);
      setCanResend(false);
      setOtpDigits(["", "", "", "", "", ""]);
      setValue("otp", "", { shouldValidate: false });

      // Focus first input
      inputRefs.current[0]?.focus();

      alert("New OTP has been sent to your email!");
    } catch (error) {
      alert("Failed to resend OTP. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  /* ---------- Submit handler ---------- */
  const onSubmit = async (values: OtpFormType) => {
    console.log("OTP verification attempt:", values);

    try {
      // Simulate API verification
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // For demo, accept any 6-digit OTP starting with 1
      if (values.otp.startsWith("1")) {
        setIsVerified(true);
        alert("Email verified successfully!");
        // In real app, you would redirect or update auth state
        // router.push("/dashboard");
      } else {
        throw new Error("Invalid OTP code");
      }
    } catch (e: any) {
      alert(e.message || "Invalid OTP. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4 md:p-6">
      <div className="w-full max-w-6xl bg-linear-to-br from-blue-100 via-sky-100 to-indigo-100 rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-3">
          {/* Left decorative panel - Matching theme */}
          <LeftDecorator />

          {/* Verification Form section */}
          <div className="p-6 md:p-8 lg:col-span-2">
            <div className="mb-8 text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start gap-3 mb-4">
                <div className="w-12 h-12 bg-linear-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Mail size={24} className="text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-linear-to-r from-green-700 to-emerald-700 bg-clip-text text-transparent">
                    Verify Your Email
                  </h1>
                  <p className="text-gray-600 mt-1">
                    Enter the 6-digit code sent to : pas078@wrc.edu.np
                  </p>
                </div>
              </div>
            </div>

            {/* Verification Card */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-blue-200/60 shadow-sm max-w-lg mx-auto lg:mx-0">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                {/* OTP Input Section */}
                <div className="space-y-4">
                  <Label className="text-blue-800 font-semibold flex items-center gap-2">
                    <Lock size={16} />
                    6-Digit Verification Code *
                  </Label>

                  <div className="space-y-2">
                    <div
                      className="flex justify-center gap-3 md:gap-4"
                      onPaste={handlePaste}
                    >
                      {otpDigits.map((digit, index) => (
                        <div key={index} className="relative">
                          <Input
                            ref={(el) => (inputRefs.current[index] = el)}
                            type="text"
                            inputMode="numeric"
                            pattern="\d"
                            maxLength={1}
                            value={digit}
                            onChange={(e) =>
                              handleOtpChange(index, e.target.value)
                            }
                            onKeyDown={(e) => handleKeyDown(index, e)}
                            className={`w-14 h-14 md:w-16 md:h-16 text-center text-2xl font-bold rounded-xl border-2 ${
                              errors.otp
                                ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                                : digit
                                ? "border-green-400 focus:border-green-500 focus:ring-green-500"
                                : "border-blue-200 focus:border-blue-500 focus:ring-blue-500"
                            }`}
                          />
                          {index < 5 && (
                            <div className="absolute top-1/2 right-0 translate-x-3 -translate-y-1/2">
                              <div className="w-2 h-0.5 bg-gray-300"></div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    <input type="hidden" {...register("otp")} />

                    {errors.otp && (
                      <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg mt-3">
                        <AlertCircle
                          size={16}
                          className="text-red-500 flex-shrink-0"
                        />
                        <p className="text-sm text-red-600">
                          {errors.otp.message}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Timer and Resend Section */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 bg-linear-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        timeLeft > 60
                          ? "bg-green-100"
                          : timeLeft > 30
                          ? "bg-yellow-100"
                          : "bg-red-100"
                      }`}
                    >
                      <Clock
                        size={18}
                        className={
                          timeLeft > 60
                            ? "text-green-600"
                            : timeLeft > 30
                            ? "text-yellow-600"
                            : "text-red-600"
                        }
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        Code expires in
                      </p>
                      <p
                        className={`text-lg font-bold ${
                          timeLeft > 60
                            ? "text-green-600"
                            : timeLeft > 30
                            ? "text-yellow-600"
                            : "text-red-600"
                        }`}
                      >
                        {formatTime(timeLeft)}
                      </p>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleResendOtp}
                    disabled={!canResend || isResending}
                    className={`border-blue-300 hover:bg-blue-50 hover:border-blue-400 rounded-xl ${
                      canResend ? "bg-blue-100" : ""
                    }`}
                  >
                    {isResending ? (
                      <>
                        <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></span>
                        Sending...
                      </>
                    ) : (
                      <>
                        <RefreshCw size={16} className="mr-2" />
                        {canResend ? "Resend Code" : "Resend Available Soon"}
                      </>
                    )}
                  </Button>
                </div>

                {/* Verify Button */}
                <div className="pt-4">
                  <Button
                    type="submit"
                    disabled={isSubmitting || otpDigits.some((d) => d === "")}
                    className="w-full py-6 bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></span>
                        Verifying...
                      </>
                    ) : (
                      <>
                        <CheckCircle size={18} className="mr-2" />
                        Verify Email
                      </>
                    )}
                  </Button>
                </div>

                {/* Success State */}
                {isVerified && (
                  <div className="animate-fade-in p-4 bg-linear-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle size={20} className="text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-green-800">
                          Email Verified Successfully!
                        </h4>
                        <p className="text-sm text-green-600">
                          Redirecting you to your dashboard...
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Divider */}
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-blue-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500">
                      Need help?
                    </span>
                  </div>
                </div>

                {/* Help Links */}
                <div className="text-center space-y-2">
                  <p className="text-gray-600">
                    Didn&apos;t receive the code?{" "}
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      className="text-blue-600 font-medium hover:text-blue-800 hover:underline transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={!canResend}
                    >
                      Resend OTP
                    </button>
                  </p>
                  <p className="text-sm text-gray-500">
                    Check your spam folder or{" "}
                    <Link
                      href="/contact"
                      className="text-blue-500 hover:underline"
                    >
                      contact support
                    </Link>
                  </p>
                </div>
              </form>
            </div>

            {/* Navigation Links */}
            <div className="mt-6 text-center max-w-lg mx-auto lg:mx-0">
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link
                  href="/login"
                  className="text-blue-600 font-medium hover:text-blue-800 hover:underline transition-colors flex items-center justify-center gap-1"
                >
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
                      d="M10 19l-7-7m0 0l7-7m-7 7h18"
                    ></path>
                  </svg>
                  Back to Login
                </Link>
                <Link
                  href="/signup"
                  className="text-blue-600 font-medium hover:text-blue-800 hover:underline transition-colors"
                >
                  Create New Account
                </Link>
                <Link
                  href="/help"
                  className="text-blue-600 font-medium hover:text-blue-800 hover:underline transition-colors"
                >
                  Help Center
                </Link>
              </div>

              <p className="text-xs text-gray-500 mt-4">
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
