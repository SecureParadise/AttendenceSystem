// components/dashboard_view/StudentDashboard.tsx
"use client";

import React, { useEffect, useState } from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import AttendanceCard from "@/components/dashboard/AttendanceCard";
import Ribbon from "@/components/dashboard/Ribbon";

/* -------------------------------
   Types that match the backend
   ------------------------------- */
type BackendStudent = {
  id: string;
  name: string;
  rollNo: string;
  semester: number | null; // numeric semester
  branch: string;
};

type BackendSubject = {
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  teacher: string;
  totalClasses: number;
  present: number;
  delayedPresent: number;
  latePresent: number;
  absent: number;
  weightedScore: number;
  maxPossibleScore: number;
  attendancePercentage: number;
  status: "good" | "warning" | "critical";
};

type DashboardResponse = {
  student: BackendStudent;
  subjects: BackendSubject[];
};

const semesterMonths = [
  { value: "paush", label: "Paush 2082" },
  { value: "magh", label: "Magh 2082" },
  { value: "falgun", label: "Falgun 2082" },
  { value: "chaitra", label: "Chaitra 2082" },
];

export default function StudentDashboard() {
  // UI state
  const [selectedMonth, setSelectedMonth] = useState<string>("paush");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Data state
  const [student, setStudent] = useState<BackendStudent | null>(null);
  const [subjects, setSubjects] = useState<BackendSubject[]>([]);

  // fallback image paths kept as before
  const defaultStudentImage = "/mukesh.jpg";

  useEffect(() => {
    // Abortable fetch with a 6s timeout and single retry on network failure
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const load = async (retry = true) => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch("/api/student/me/dashboard", {
          method: "GET",
          headers: { Accept: "application/json" },
          signal: controller.signal,
        });

        if (res.status === 401) {
          // not authenticated -> redirect to login
          window.location.href = "/login";
          return;
        }

        if (res.status === 404) {
          setError("Student data not found.");
          setLoading(false);
          return;
        }

        if (!res.ok) {
          // 500 etc.
          const text = await res.text();
          throw new Error(text || `Server returned ${res.status}`);
        }

        const data: DashboardResponse = await res.json();

        // set data into state
        setStudent(data.student);
        setSubjects(data.subjects || []);
        setLoading(false);
      } catch (err: any) {
        // If aborted, show friendly message
        if (err?.name === "AbortError") {
          if (navigator.onLine === false) {
            setError("Network offline. Please check your connection.");
            setLoading(false);
            return;
          }

          // retry once if allowed
          if (retry) {
            // small delay before retry
            setTimeout(() => load(false), 400);
            return;
          }

          setError("Request timed out. Try again.");
          setLoading(false);
          return;
        }

        // network error or other exceptions
        if (retry) {
          setTimeout(() => load(false), 400);
          return;
        }

        setError(err?.message || "Failed to load dashboard.");
        setLoading(false);
      } finally {
        clearTimeout(timeout);
      }
    };

    load(true);

    // cleanup on unmount
    return () => {
      controller.abort();
      clearTimeout(timeout);
    };
  }, []);

  // derive label
  const selectedMonthLabel =
    semesterMonths.find((m) => m.value === selectedMonth)?.label ||
    "Paush 2082";

  return (
    <div className="min-h-screen bg-linear-to-b from-blue-50 to-gray-50">
      {/* Header - pass student info (or fallback strings) */}
      <div className="sticky top-0 z-50">
        <DashboardHeader
          src={
            student?.id
              ? student.image ?? defaultStudentImage
              : defaultStudentImage
          }
          alt={student?.name ?? "student image"}
          name={student?.name ?? "Student Name"}
          rollNo={student?.rollNo ?? "—"}
          semester={student?.semester ?? undefined}
          branch={student?.branch ?? "Electronics Communication & Information"}
        />
        <Ribbon
          selectedMonth={selectedMonth}
          onMonthChange={setSelectedMonth}
          semesterMonths={semesterMonths}
        />
      </div>

      <main className="p-4 md:p-6 pt-6">
        <div className="max-w-7xl mx-auto">
          {/* Loading / Error states */}
          {loading && (
            <div className="py-8 flex items-center justify-center">
              <div className="text-gray-600">Loading dashboard…</div>
            </div>
          )}

          {error && !loading && (
            <div className="bg-red-50 border border-red-100 text-red-700 p-4 rounded-md mb-6">
              {error}
            </div>
          )}

          {!loading && !error && (
            <>
              {/* Subject Cards Grid */}
              <div className="mb-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                  {subjects.length === 0 ? (
                    <div className="col-span-full text-center text-gray-600 p-6 bg-white rounded-xl border">
                      No subjects found for this semester.
                    </div>
                  ) : (
                    subjects.map((subject) => (
                      <AttendanceCard
                        key={subject.subjectId}
                        subject={subject}
                      />
                    ))
                  )}
                </div>
              </div>

              {/* Legend Section (unchanged) */}
              <div className="bg-white rounded-xl shadow p-6">
                <h3 className="font-bold text-gray-800 mb-4">
                  Attendance Legend
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-bold">
                      P
                    </div>
                    <div>
                      <div className="font-semibold text-green-700">
                        Present
                      </div>
                      <div className="text-sm text-green-600">
                        Within 20 min
                      </div>
                      <div className="text-xs text-green-500">Weight: 1.0</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center text-white font-bold">
                      DP
                    </div>
                    <div>
                      <div className="font-semibold text-yellow-700">
                        Delayed Present
                      </div>
                      <div className="text-sm text-yellow-600">
                        20-45 min late
                      </div>
                      <div className="text-xs text-yellow-500">Weight: 0.8</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold">
                      LP
                    </div>
                    <div>
                      <div className="font-semibold text-orange-700">
                        Late Present
                      </div>
                      <div className="text-sm text-orange-600">
                        After 45 min
                      </div>
                      <div className="text-xs text-orange-500">Weight: 0.6</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center text-white font-bold">
                      A
                    </div>
                    <div>
                      <div className="font-semibold text-red-700">Absent</div>
                      <div className="text-sm text-red-600">Did not attend</div>
                      <div className="text-xs text-red-500">Weight: 0.0</div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-200">
                  <h4 className="font-semibold text-gray-800 mb-3">
                    Attendance Thresholds:
                  </h4>
                  <div className="flex items-center justify-center gap-6">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-green-500"></div>
                      <span className="text-sm font-medium text-gray-700">
                        Good: ≥80%
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
                      <span className="text-sm font-medium text-gray-700">
                        Warning: 70-79%
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-red-500"></div>
                      <span className="text-sm font-medium text-gray-700">
                        Critical: &lt;70%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
