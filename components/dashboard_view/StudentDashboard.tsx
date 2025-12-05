// components/dashboard_view/StudentDashboard.tsx

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

// Function to calculate weighted attendance with proper return type
const calculateWeightedAttendance = (
  present: number,
  delayedPresent: number,
  latePresent: number,
  absent: number,
  totalClasses: number
): {
  weightedScore: number;
  maxPossibleScore: number;
  attendancePercentage: number;
  status: "good" | "warning" | "critical";
} => {
  const weightedScore =
    present * 1.0 + delayedPresent * 0.8 + latePresent * 0.6 + absent * 0;
  const attendancePercentage =
    totalClasses > 0 ? (weightedScore / totalClasses) * 100 : 0;

  let status: "good" | "warning" | "critical";
  if (attendancePercentage >= 80) {
    status = "good";
  } else if (attendancePercentage >= 70) {
    status = "warning";
  } else {
    status = "critical";
  }

  return {
    weightedScore: parseFloat(weightedScore.toFixed(2)),
    maxPossibleScore: totalClasses,
    attendancePercentage: parseFloat(attendancePercentage.toFixed(1)),
    status,
  };
};

// Helper function to create complete subject objects
const createSubject = (
  id: number,
  subjectCode: string,
  subjectName: string,
  teacher: string,
  totalClasses: number,
  present: number,
  delayedPresent: number,
  latePresent: number,
  absent: number
): SubjectAttendance => {
  const weightedData = calculateWeightedAttendance(
    present,
    delayedPresent,
    latePresent,
    absent,
    totalClasses
  );

  return {
    id,
    subjectCode,
    subjectName,
    teacher,
    totalClasses,
    present,
    delayedPresent,
    latePresent,
    absent,
    weightedScore: weightedData.weightedScore,
    maxPossibleScore: weightedData.maxPossibleScore,
    attendancePercentage: weightedData.attendancePercentage,
    status: weightedData.status,
  };
};

// Mock data based on your schedule with proper weighted calculations
const mockSubjects: SubjectAttendance[] = [
  createSubject(1, "OS", "Operating Systems", "BP", 16, 10, 3, 1, 2),
  createSubject(
    2,
    "COA",
    "Computer Organization & Architecture",
    "BHP",
    12,
    8,
    2,
    0,
    2
  ),
  createSubject(3, "CN", "Computer Networks", "PA", 12, 7, 2, 1, 2),
  createSubject(4, "DBMS", "Database Management System", "RKC", 12, 6, 3, 1, 2),
  createSubject(5, "FD", "Filter Design", "BS", 8, 4, 2, 1, 1),
  createSubject(6, "EE", "Engineering Economics", "KKB", 8, 5, 1, 1, 1),
  createSubject(7, "CN Lab", "Computer Networks Lab", "PA", 8, 6, 1, 0, 1),
  createSubject(8, "DBMS Lab", "Database Management System Lab", "RKC", 8, 7, 0, 0, 1),
  createSubject(9, "OS Lab", "Operating Systems Lab", "BP", 8, 5, 1, 1, 1),
  createSubject(
    10,
    "COA Lab",
    "Computer Organization & Architecture Lab",
    "BHP",
    8,
    6,
    1,
    0,
    1
  ),
  createSubject(11, "FD Lab", "Filter Design Lab", "BS", 8, 5, 2, 0, 1),
];

// Month options for 5th semester
const semesterMonths = [
  { value: "paush", label: "Paush 2082" },
  { value: "magh", label: "Magh 2082" },
  { value: "falgun", label: "Falgun 2082" },
  { value: "chaitra", label: "Chaitra 2082" },
];

const StudentDashboard = () => {
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

export default StudentDashboard;