// components/dashboard_view/TeacherDashboard.tsx
"use client";

import React, { useEffect, useState } from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import Ribbon from "@/components/dashboard/Ribbon";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { BookOpen } from "lucide-react";

/**
 * TeacherDashboard - Client component
 * Fetches teacher dashboard payload from /api/teacher/me/dashboard
 * Dev helpers:
 *   ?teacherId=<id>       - prefer this if present
 *   ?teacherEmail=<email> - fallback to this
 *
 * Save this file at: components/dashboard_view/TeacherDashboard.tsx
 */

type TeacherSubject = {
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  totalClasses: number;
  totalStudents: number;
  presentStudents: number;
  attendancePercentage: number;
  status: "good" | "warning" | "critical";
};

type TeacherPayload = {
  teacher: { id: string; name: string; email?: string | null; department?: string | null };
  subjects: TeacherSubject[];
};

const monthOptions = [
  { value: "jan", label: "January" },
  { value: "feb", label: "February" },
  { value: "mar", label: "March" },
  { value: "apr", label: "April" },
];

export default function TeacherDashboard(): JSX.Element {
  // UI state
  const [selectedMonth, setSelectedMonth] = useState<string>("jan");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Data state
  const [payload, setPayload] = useState<TeacherPayload | null>(null);

  useEffect(() => {
    // Read dev helper params from the current URL:
    // prefer teacherId, else teacherEmail. If neither present, call endpoint
    // without params (production/auth expected).
    const urlParams = new URL(window.location.href).searchParams;
    const DEV_TEACHER_ID = urlParams.get("teacherId") || "";
    const DEV_TEACHER_EMAIL = urlParams.get("teacherEmail") || "";

    // Build fetch URL according to available helper params
    const buildUrl = () => {
      if (DEV_TEACHER_ID) return `/api/teacher/me/dashboard?teacherId=${encodeURIComponent(DEV_TEACHER_ID)}`;
      if (DEV_TEACHER_EMAIL) return `/api/teacher/me/dashboard?teacherEmail=${encodeURIComponent(DEV_TEACHER_EMAIL)}`;
      return `/api/teacher/me/dashboard`;
    };

    const controller = new AbortController();
    const timeoutMs = 6000; // 6s timeout for the request
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    let didCancel = false;

    async function load(retry = true) {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(buildUrl(), { signal: controller.signal });

        if (res.status === 401) {
          // Not authenticated — redirect to login (simple behavior)
          window.location.href = "/login";
          return;
        }

        if (res.status === 400) {
          const json = await res.json().catch(() => null);
          setError(json?.error ?? "Bad request (400).");
          setLoading(false);
          return;
        }

        if (res.status === 404) {
          setError("Teacher not found.");
          setLoading(false);
          return;
        }

        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || `Server returned ${res.status}`);
        }

        const data: TeacherPayload = await res.json();

        if (didCancel) return;
        setPayload(data);
        setLoading(false);
      } catch (err: any) {
        if (didCancel) return;

        // Abort (timeout) handling
        if (err?.name === "AbortError") {
          if (navigator.onLine === false) {
            setError("Network offline. Check your connection.");
            setLoading(false);
            return;
          }
          if (retry) {
            // retry once after a short delay
            setTimeout(() => load(false), 300);
            return;
          }
          setError("Request timed out. Try again.");
          setLoading(false);
          return;
        }

        // Generic network/server error
        if (retry) {
          setTimeout(() => load(false), 300);
          return;
        }

        setError(err?.message || "Failed to load teacher dashboard.");
        setLoading(false);
      } finally {
        clearTimeout(timeout);
      }
    }

    load(true);

    return () => {
      didCancel = true;
      controller.abort();
      clearTimeout(timeout);
    };
  }, []); // run once on mount

  return (
    <div className="min-h-screen bg-linear-to-b from-blue-50 to-gray-50">
      <div className="sticky top-0 z-50">
        <DashboardHeader
          src="/tech.jpg"
          alt={payload?.teacher.name ?? "teacher image"}
          name={payload?.teacher.name ?? "Teacher"}
          rollNo={payload?.teacher.email ?? "—"}
          semester={undefined}
          branch={payload?.teacher.department ?? "—"}
        />
        <Ribbon selectedMonth={selectedMonth} onMonthChange={setSelectedMonth} semesterMonths={monthOptions} />
      </div>

      <main className="p-4 md:p-6 pt-6">
        <div className="max-w-7xl mx-auto">
          {loading && <div className="py-8 text-center text-gray-600">Loading teacher dashboard…</div>}

          {error && !loading && (
            <div className="bg-red-50 border border-red-100 text-red-700 p-4 rounded-md mb-6">{error}</div>
          )}

          {!loading && !error && payload && (
            <div className="mb-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {payload.subjects.length === 0 ? (
                  <div className="col-span-full text-center text-gray-600 p-6 bg-white rounded-xl border">No subjects found.</div>
                ) : (
                  payload.subjects.map((s) => (
                    <div
                      key={s.subjectId}
                      className="bg-white rounded-xl shadow-md border border-gray-100 hover:shadow-lg hover:border-blue-200 transition-all duration-300 h-full"
                    >
                      <div className="p-4 flex flex-col h-full">
                        <div className="mb-3">
                          <div className="flex items-center gap-2 mb-1">
                            <BookOpen size={16} className="text-blue-600" />
                            <h3 className="font-bold text-gray-800 truncate">
                              {s.subjectCode} — {s.subjectName}
                            </h3>
                          </div>
                          <p className="text-xs text-gray-600 mb-1">Students: {s.totalStudents}</p>
                        </div>

                        <div className="flex-1 grid grid-cols-2 gap-3 mb-3">
                          <div className="h-28">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={[
                                    { name: "Present", value: s.presentStudents },
                                    { name: "Absent", value: Math.max(0, s.totalStudents - s.presentStudents) },
                                  ]}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={15}
                                  outerRadius={28}
                                  paddingAngle={1}
                                  dataKey="value"
                                >
                                  {/* present slice color */}
                                  <Cell
                                    key="present"
                                    fill={s.status === "good" ? "#10B981" : s.status === "warning" ? "#F59E0B" : "#EF4444"}
                                  />
                                  {/* absent slice color */}
                                  <Cell key="absent" fill="#E5E7EB" />
                                </Pie>
                              </PieChart>
                            </ResponsiveContainer>
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-gray-600">Classes:</span>
                              <span className="font-bold text-gray-800">{s.totalClasses}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-green-600">Present:</span>
                              <span className="font-bold text-green-700">{s.presentStudents}</span>
                            </div>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-gray-100">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-gray-600">Attendance:</span>
                            <span
                              className={`font-bold text-lg ${
                                s.attendancePercentage >= 80 ? "text-green-600" : s.attendancePercentage >= 70 ? "text-yellow-600" : "text-red-600"
                              }`}
                            >
                              {s.attendancePercentage}%
                            </span>
                          </div>

                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                s.attendancePercentage >= 80 ? "bg-green-500" : s.attendancePercentage >= 70 ? "bg-yellow-500" : "bg-red-500"
                              }`}
                              style={{ width: `${Math.min(s.attendancePercentage, 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
