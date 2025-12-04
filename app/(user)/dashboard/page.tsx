// app/(user)/dashboard/page.tsx
"use client";

import { useState } from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import AttendanceCard from "@/components/dashboard/AttendanceCard";
import Ribbon from "@/components/dashboard/Ribbon";

// Define types for attendance data
interface SubjectAttendance {
  id: number;
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
}

// Function to calculate weighted attendance
const calculateWeightedAttendance = (
  present: number,
  delayedPresent: number,
  latePresent: number,
  absent: number,
  totalClasses: number
) => {
  const weightedScore =
    present * 1.0 + delayedPresent * 0.8 + latePresent * 0.6 + absent * 0;
  const attendancePercentage =
    totalClasses > 0 ? (weightedScore / totalClasses) * 100 : 0;

  return {
    weightedScore: parseFloat(weightedScore.toFixed(2)),
    maxPossibleScore: totalClasses,
    attendancePercentage: parseFloat(attendancePercentage.toFixed(1)),
    status:
      attendancePercentage >= 80
        ? "good"
        : attendancePercentage >= 70
        ? "warning"
        : "critical",
  };
};

// Mock data based on your schedule with proper weighted calculations
const mockSubjects: SubjectAttendance[] = [
  {
    id: 1,
    subjectCode: "OS",
    subjectName: "Operating Systems",
    teacher: "BP",
    totalClasses: 16,
    present: 10,
    delayedPresent: 3,
    latePresent: 1,
    absent: 2,
    ...calculateWeightedAttendance(10, 3, 1, 2, 16),
  },
  {
    id: 2,
    subjectCode: "COA",
    subjectName: "Computer Organization & Architecture",
    teacher: "BHP",
    totalClasses: 12,
    present: 8,
    delayedPresent: 2,
    latePresent: 0,
    absent: 2,
    ...calculateWeightedAttendance(8, 2, 0, 2, 12),
  },
  {
    id: 3,
    subjectCode: "CN",
    subjectName: "Computer Networks",
    teacher: "PA",
    totalClasses: 12,
    present: 7,
    delayedPresent: 2,
    latePresent: 1,
    absent: 2,
    ...calculateWeightedAttendance(7, 2, 1, 2, 12),
  },
  {
    id: 4,
    subjectCode: "DBMS",
    subjectName: "Database Management System",
    teacher: "RKC",
    totalClasses: 12,
    present: 6,
    delayedPresent: 3,
    latePresent: 1,
    absent: 2,
    ...calculateWeightedAttendance(6, 3, 1, 2, 12),
  },
  {
    id: 5,
    subjectCode: "FD",
    subjectName: "Filter Design",
    teacher: "BS",
    totalClasses: 8,
    present: 4,
    delayedPresent: 2,
    latePresent: 1,
    absent: 1,
    ...calculateWeightedAttendance(4, 2, 1, 1, 8),
  },
  {
    id: 6,
    subjectCode: "EE",
    subjectName: "Engineering Economics",
    teacher: "KKB",
    totalClasses: 8,
    present: 5,
    delayedPresent: 1,
    latePresent: 1,
    absent: 1,
    ...calculateWeightedAttendance(5, 1, 1, 1, 8),
  },
  {
    id: 7,
    subjectCode: "CN Lab",
    subjectName: "Computer Networks Lab",
    teacher: "PA",
    totalClasses: 8,
    present: 6,
    delayedPresent: 1,
    latePresent: 0,
    absent: 1,
    ...calculateWeightedAttendance(6, 1, 0, 1, 8),
  },
  {
    id: 8,
    subjectCode: "DBMS Lab",
    subjectName: "Database Management System Lab",
    teacher: "RKC",
    totalClasses: 8,
    present: 7,
    delayedPresent: 0,
    latePresent: 0,
    absent: 1,
    ...calculateWeightedAttendance(7, 0, 0, 1, 8),
  },
  {
    id: 9,
    subjectCode: "OS Lab",
    subjectName: "Operating Systems Lab",
    teacher: "BP",
    totalClasses: 8,
    present: 5,
    delayedPresent: 1,
    latePresent: 1,
    absent: 1,
    ...calculateWeightedAttendance(5, 1, 1, 1, 8),
  },
  {
    id: 10,
    subjectCode: "COA Lab",
    subjectName: "Computer Organization & Architecture Lab",
    teacher: "BHP",
    totalClasses: 8,
    present: 6,
    delayedPresent: 1,
    latePresent: 0,
    absent: 1,
    ...calculateWeightedAttendance(6, 1, 0, 1, 8),
  },
  {
    id: 11,
    subjectCode: "FD Lab",
    subjectName: "Filter Design Lab",
    teacher: "BS",
    totalClasses: 8,
    present: 5,
    delayedPresent: 2,
    latePresent: 0,
    absent: 1,
    ...calculateWeightedAttendance(5, 2, 0, 1, 8),
  },
];

// Month options for 5th semester
const semesterMonths = [
  { value: "paush", label: "Paush 2082" },
  { value: "magh", label: "Magh 2082" },
  { value: "falgun", label: "Falgun 2082" },
  { value: "chaitra", label: "Chaitra 2082" },
];

const Page = () => {
  const [selectedMonth, setSelectedMonth] = useState("paush");

  const selectedMonthLabel =
    semesterMonths.find((m) => m.value === selectedMonth)?.label ||
    "Paush 2082";

  return (
    <div className="min-h-screen bg-linear-to-b from-blue-50 to-gray-50">
      {/* Fixed Header Section - Always stays at top */}
      <div className="sticky top-0 z-50">
        <DashboardHeader />
        <Ribbon
          selectedMonth={selectedMonth}
          onMonthChange={setSelectedMonth}
          semesterMonths={semesterMonths}
        />
      </div>

      {/* Main Content - Scrolls normally */}
      <main className="p-4 md:p-6 pt-6">
        <div className="max-w-7xl mx-auto">
          {/* Overall Statistics Banner - Simple and clean */}
          

          {/* Subject Cards Grid */}
          <div className="mb-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {mockSubjects.map((subject) => (
                <AttendanceCard key={subject.id} subject={subject} />
              ))}
            </div>
          </div>

          {/* Legend Section */}
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="font-bold text-gray-800 mb-4">Attendance Legend</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-bold">
                  P
                </div>
                <div>
                  <div className="font-semibold text-green-700">Present</div>
                  <div className="text-sm text-green-600">Within 20 min</div>
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
                  <div className="text-sm text-yellow-600">20-45 min late</div>
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
                  <div className="text-sm text-orange-600">After 45 min</div>
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
            
            {/* Simple Threshold Info */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <h4 className="font-semibold text-gray-800 mb-3">
                Attendance Thresholds:
              </h4>
              <div className="flex items-center justify-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-green-500"></div>
                  <span className="text-sm font-medium text-gray-700">Good: ≥80%</span>
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
        </div>
      </main>
    </div>
  );
};

export default Page;