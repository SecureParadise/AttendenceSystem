// TeacherDashboard.tsx
"use client";

import { useState } from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import Ribbon from "@/components/dashboard/Ribbon";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { BookOpen } from "lucide-react";

// Define type for teacher's subject data
interface TeacherSubject {
  id: number;
  subjectName: string;
  departmentName: string;
  totalClasses: number;
  presentStudents: number;
  totalStudents: number;
  attendancePercentage: number;
  status: "good" | "warning" | "critical";
}

// Helper to create subject data with computed percentage/status
const createTeacherSubject = (
  id: number,
  subjectName: string,
  departmentName: string,
  totalClasses: number,
  presentStudents: number,
  totalStudents: number
): TeacherSubject => {
  const attendancePercentage = totalStudents > 0 ? (presentStudents / totalStudents) * 100 : 0;
  let status: "good" | "warning" | "critical";
  if (attendancePercentage >= 80) {
    status = "good";
  } else if (attendancePercentage >= 70) {
    status = "warning";
  } else {
    status = "critical";
  }
  return {
    id,
    subjectName,
    departmentName,
    totalClasses,
    presentStudents,
    totalStudents,
    attendancePercentage: parseFloat(attendancePercentage.toFixed(1)),
    status,
  };
};

// Mock data for teacher's subjects
const mockTeacherSubjects: TeacherSubject[] = [
  createTeacherSubject(1, "Operating Systems", "BEI", 16, 12, 15),
  createTeacherSubject(2, "Computer Networks", "BEI", 12, 8, 12),
  createTeacherSubject(3, "Database Management", "BEI", 14, 9, 14),
  createTeacherSubject(4, "Filter Design", "BEX", 10, 6, 10),
];

// Month/Semester options
const semesterMonths = [
  { value: "jan", label: "January 2024" },
  { value: "feb", label: "February 2024" },
  { value: "mar", label: "March 2024" },
  { value: "apr", label: "April 2024" },
];

const TeacherDashboard = () => {
  const [selectedMonth, setSelectedMonth] = useState("jan");

  return (
    <div className="min-h-screen bg-linear-to-b from-blue-50 to-gray-50">
      {/* Fixed Header with Ribbon */}
      <div className="sticky top-0 z-50">
        <DashboardHeader />
        <Ribbon
          selectedMonth={selectedMonth}
          onMonthChange={setSelectedMonth}
          semesterMonths={semesterMonths}
        />
      </div>

      {/* Main Content */}
      <main className="p-4 md:p-6 pt-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {mockTeacherSubjects.map((subject) => (
                <div
                  key={subject.id}
                  className="bg-white rounded-xl shadow-md border border-gray-100 hover:shadow-lg hover:border-blue-200 transition-all duration-300 h-full"
                >
                  <div className="p-4 flex flex-col h-full">
                    {/* Card Header: Subject Name & Department */}
                    <div className="mb-3">
                      <div className="flex items-center gap-2 mb-1">
                        <BookOpen size={16} className="text-blue-600" />
                        <h3 className="font-bold text-gray-800 truncate">
                          {subject.subjectName}
                        </h3>
                      </div>
                      <p className="text-xs text-gray-600 mb-1">
                        Department: {subject.departmentName}
                      </p>
                    </div>

                    {/* Main Content: Pie Chart and Stats */}
                    <div className="flex-1 grid grid-cols-2 gap-3 mb-3">
                      {/* Pie Chart (Present vs Absent) */}
                      <div className="h-28">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={[
                                { name: "Present", value: subject.presentStudents },
                                { name: "Absent", value: subject.totalStudents - subject.presentStudents },
                              ]}
                              cx="50%"
                              cy="50%"
                              innerRadius={15}
                              outerRadius={28}
                              paddingAngle={1}
                              dataKey="value"
                            >
                              {/* Color slice by status, remainder gray */}
                              <Cell
                                fill={
                                  subject.status === "good"
                                    ? "#10B981"
                                    : subject.status === "warning"
                                    ? "#F59E0B"
                                    : "#EF4444"
                                }
                              />
                              <Cell fill="#E5E7EB" />
                            </Pie>
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      {/* Stats (Total Classes) */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-600">Classes:</span>
                          <span className="font-bold text-gray-800">
                            {subject.totalClasses}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Footer: Attendance Percentage */}
                    <div className="pt-3 border-t border-gray-100">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-600">Attendance:</span>
                        <span
                          className={`font-bold text-lg ${
                            subject.attendancePercentage >= 80
                              ? "text-green-600"
                              : subject.attendancePercentage >= 70
                              ? "text-yellow-600"
                              : "text-red-600"
                          }`}
                        >
                          {subject.attendancePercentage}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            subject.attendancePercentage >= 80
                              ? "bg-green-500"
                              : subject.attendancePercentage >= 70
                              ? "bg-yellow-500"
                              : "bg-red-500"
                          }`}
                          style={{ width: `${Math.min(subject.attendancePercentage, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TeacherDashboard;
