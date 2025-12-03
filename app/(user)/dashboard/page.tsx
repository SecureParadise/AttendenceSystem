// app/(user)/dashboard/page.tsx
"use client";

import { useState} from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import subjectsData_rec, { monthStats } from "@/lib/subjectData";
import { Calendar, Users, CheckCircle, XCircle } from "lucide-react";

// Attendance type colors
const attendanceColors = {
  present: "#079C0C",
  absent: "#EF4444",
  dp: "#FFC107", // Delay Present after 20 min of class start
  lp: "#26C6DA", // Present at last time after 45 min of class start
  holiday: "#F77E2D",
};

const DashboardPage = () => {
  const [subjects, setSubjects] = useState(subjectsData_rec);
  const [stats, setStats] = useState(monthStats);

  // Helper function to prepare pie chart data for a subject
  const getPieChartData = (subject: (typeof subjectsData_rec)[0]) => {
    return [
      {
        name: "Present",
        value: subject.present,
        color: attendanceColors.present,
      },
      { name: "Absent", value: subject.absent, color: attendanceColors.absent },
      { name: "DP", value: subject.dp, color: attendanceColors.dp },
      { name: "LP", value: subject.lp, color: attendanceColors.lp },
      {
        name: "Holiday",
        value: subject.holiday,
        color: attendanceColors.holiday,
      },
    ].filter((item) => item.value > 0);
  };

  // Custom tooltip for pie chart
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 backdrop-blur-sm p-3 rounded-lg border border-blue-200 shadow-lg">
          <p className="font-semibold text-blue-800">{payload[0].name}</p>
          <p className="text-sm text-gray-700">
            Classes: <span className="font-bold">{payload[0].value}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  // Calculate date for Paush 2082
  const getPaush2082Info = () => {
    // Paush 2082 in Bikram Sambat corresponds to Dec 15, 2024 - Jan 13, 2025
    const startDate = new Date('2024-12-15');
    const endDate = new Date('2025-01-13');
    
    return {
      startDate: startDate.toLocaleDateString('en-US', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      }),
      endDate: endDate.toLocaleDateString('en-US', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      }),
      totalDays: 31,
      workingDays: 31 - 4 - 3, // Total days - Saturdays - Holidays
    };
  };

  const paushInfo = getPaush2082Info();

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Fixed Header - Always at top */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <DashboardHeader />
      </div>

      {/* Main Content with padding for fixed header */}
      <main className="p-4 md:p-6 pt-20 md:pt-24">
        {/* Header Section with Month Info */}
        <div className="mb-6 md:mb-8">
          
        </div>

        {/* Legend */}
        <div className="size-full mb-6 bg-white/80 backdrop-blur-sm rounded-2xl p-3 md:p-4 border border-blue-200/60 shadow-sm">
          <h3 className="text-base md:text-lg font-semibold text-blue-800 mb-2 md:mb-3">
            Attendance Legend
          </h3>
          <div className="flex flex-wrap gap-3 md:gap-4">
            {Object.entries(attendanceColors).map(([key, color]) => (
              <div key={key} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 md:w-4 md:h-4 rounded-full shirink-0"
                  style={{ backgroundColor: color }}
                />
                <span className="text-xs md:text-sm text-gray-700 font-medium">
                  {key.toUpperCase()}
                  {key === "present" && " - On Time"}
                  {key === "absent" && " - Not Present"}
                  {key === "dp" && " - Delay Present (after 20 min)"}
                  {key === "lp" && " - Last Present (after 45 min)"}
                  {key === "holiday" && " - Holiday"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Subjects Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {subjects.map((subject) => {
            const pieData = getPieChartData(subject);
            const attendedClasses = subject.present + subject.dp + subject.lp;
            const effectiveTotal = subject.totalClasses - subject.holiday;
            const attendancePercentage = effectiveTotal > 0 
              ? Math.round((attendedClasses / effectiveTotal) * 100)
              : 0;

            return (
              <div
                key={subject.id}
                className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 md:p-5 border border-blue-200/60 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                {/* Card Header */}
                <div className="mb-3 md:mb-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="max-w-[70%] shirink-0">
                      <h3 className="font-bold text-base md:text-lg text-blue-800 truncate">
                        {subject.name}
                      </h3>
                      <p className="text-xs md:text-sm text-gray-600">
                        {subject.teacher}
                      </p>
                    </div>
                    <div className="text-right shirink-0">
                      <div
                        className={`px-2 py-1 rounded-full text-xs md:text-sm font-semibold ${
                          attendancePercentage >= 85
                            ? "bg-green-100 text-green-800"
                            : attendancePercentage >= 75
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {attendancePercentage}%
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-2 md:mb-3">
                    <div
                      className="w-2 h-2 md:w-3 md:h-3 rounded-full shirink-0"
                      style={{ backgroundColor: subject.color }}
                    />
                    <span className="text-xs md:text-sm text-gray-700">
                      {subject.totalClasses} classes • {subject.name.includes('Lab') ? 'Lab' : 'Theory'}
                    </span>
                  </div>
                </div>

                {/* Pie Chart */}
                <div className="h-40 md:h-48 mb-3 md:mb-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={30}
                        outerRadius={60}
                        paddingAngle={2}
                        dataKey="value"
                        label={(entry) => entry.name}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend
                        layout="horizontal"
                        verticalAlign="bottom"
                        align="center"
                        wrapperStyle={{
                          fontSize: "10px",
                          paddingTop: "5px",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Attendance Details */}
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2 text-xs md:text-sm">
                    <div className="flex items-center justify-between bg-blue-50/50 p-2 rounded-lg">
                      <span className="text-gray-700">Present:</span>
                      <div className="flex items-center gap-1">
                        <CheckCircle size={12} className="text-green-600" />
                        <span className="font-semibold text-green-700 shirink-0">
                          {subject.present}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between bg-blue-50/50 p-2 rounded-lg">
                      <span className="text-gray-700">Absent:</span>
                      <div className="flex items-center gap-1">
                        <XCircle size={12} className="text-red-600" />
                        <span className="font-semibold text-red-700 shirink-0">
                          {subject.absent}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between bg-blue-50/50 p-2 rounded-lg">
                      <span className="text-gray-700">DP:</span>
                      <span className="font-semibold text-yellow-700 shirink-0">
                        {subject.dp}
                      </span>
                    </div>
                    <div className="flex items-center justify-between bg-blue-50/50 p-2 rounded-lg">
                      <span className="text-gray-700">LP:</span>
                      <span className="font-semibold text-cyan-700 shirink-0">
                        {subject.lp}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-2 md:mt-3">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Attendance Progress</span>
                      <span className="shirink-0 font-semibold">
                        {attendancePercentage}% ({attendedClasses}/{effectiveTotal})
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 md:h-2">
                      <div
                        className={`h-1.5 md:h-2 rounded-full transition-all duration-500 ${
                          attendancePercentage >= 85
                            ? "bg-green-500"
                            : attendancePercentage >= 75
                            ? "bg-yellow-500"
                            : "bg-red-500"
                        }`}
                        style={{ width: `${attendancePercentage}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* View Details Link */}
                <button className="w-full mt-3 md:mt-4 py-1.5 md:py-2 bg-linear-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 text-blue-700 font-medium rounded-lg transition-all duration-300 border border-blue-200 hover:border-blue-300 text-sm md:text-base hover:scale-[1.02] active:scale-[0.98]">
                  View Detailed Report
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer Stats */}
        <div className="mt-6 md:mt-8 bg-white/80 backdrop-blur-sm rounded-2xl p-4 md:p-6 border border-blue-200/60 shadow-sm">
          <h3 className="text-lg md:text-xl font-bold text-blue-800 mb-3 md:mb-4">
            Paush 2082 Summary
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            <div className="bg-linear-to-br from-green-500 to-green-600 text-white p-3 md:p-4 rounded-xl">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle size={20} />
                <p className="text-xs md:text-sm opacity-90">Total Present</p>
              </div>
              <p className="text-xl md:text-2xl font-bold">{stats.totalPresent}</p>
            </div>
            
            <div className="bg-linear-to-br from-red-500 to-red-600 text-white p-3 md:p-4 rounded-xl">
              <div className="flex items-center gap-2 mb-1">
                <XCircle size={20} />
                <p className="text-xs md:text-sm opacity-90">Total Absent</p>
              </div>
              <p className="text-xl md:text-2xl font-bold">{stats.totalAbsent}</p>
            </div>
            
            <div className="bg-linear-to-br from-blue-500 to-blue-600 text-white p-3 md:p-4 rounded-xl">
              <div className="flex items-center gap-2 mb-1">
                <Users size={20} />
                <p className="text-xs md:text-sm opacity-90">Best Subject</p>
              </div>
              <p className="text-lg md:text-xl font-bold truncate">{stats.bestSubject}</p>
            </div>
            
            <div className="bg-linear-to-br from-purple-500 to-purple-600 text-white p-3 md:p-4 rounded-xl">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                  <span className="text-sm font-bold">%</span>
                </div>
                <p className="text-xs md:text-sm opacity-90">Overall Attendance</p>
              </div>
              <p className="text-xl md:text-2xl font-bold">{stats.overallPercentage}%</p>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 bg-white/80 backdrop-blur-sm rounded-2xl p-4 md:p-6 border border-blue-200/60 shadow-sm">
          <h4 className="text-base md:text-lg font-semibold text-blue-800 mb-3">
            Month Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Month:</span> Paush 2082
              </p>
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Total Days:</span> {paushInfo.totalDays}
              </p>
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Saturdays:</span> 4
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Public Holidays:</span> 3
              </p>
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Working Days:</span> {paushInfo.workingDays}
              </p>
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Period:</span> {paushInfo.startDate} to {paushInfo.endDate}
              </p>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-4 md:mt-6 text-center">
          <p className="text-xs md:text-sm text-gray-600">
            <span className="font-semibold">Note:</span> 
            <span className="ml-1">DP = Delay Present (after 20 minutes), LP = Last Present (after 45 minutes)</span>
          </p>
          <p className="text-xs text-gray-500 mt-2">
            © {new Date().getFullYear()} Tribhuvan University, Pashchimanchal Campus. 
            Data calculated for Paush 2082 (Dec 2024 - Jan 2025)
          </p>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;