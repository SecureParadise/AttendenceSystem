// components/dashboard/OverallStats.tsx
"use client";

import { TrendingUp, TrendingDown, Target } from "lucide-react";

interface OverallStatsProps {
  attendance: {
    total: number;
    present: number;
    percentage: number;
    score: number;
    maxScore: number;
  };
  totalSubjects: number;
}

const OverallStats = ({ attendance, totalSubjects }: OverallStatsProps) => {
  const absent = attendance.total - attendance.present;
  const isTrendingUp = attendance.percentage >= 75;

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-800">Overall Attendance Summary</h2>
        <div className={`flex items-center gap-1 px-3 py-1 rounded-full ${
          isTrendingUp 
            ? 'bg-green-100 text-green-700' 
            : 'bg-red-100 text-red-700'
        }`}>
          {isTrendingUp ? (
            <TrendingUp size={16} />
          ) : (
            <TrendingDown size={16} />
          )}
          <span className="text-sm font-medium">
            {attendance.percentage.toFixed(1)}%
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Classes */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <div className="text-sm text-blue-600 font-medium mb-1">Total Classes</div>
          <div className="text-2xl font-bold text-blue-800">{attendance.total}</div>
          <div className="text-xs text-blue-500 mt-1">All subjects combined</div>
        </div>

        {/* Present */}
        <div className="bg-green-50 p-4 rounded-lg border border-green-100">
          <div className="text-sm text-green-600 font-medium mb-1">Present</div>
          <div className="text-2xl font-bold text-green-800">{attendance.present}</div>
          <div className="text-xs text-green-500 mt-1">
            {attendance.total > 0 ? ((attendance.present / attendance.total) * 100).toFixed(1) : 0}% of total
          </div>
        </div>

        {/* Absent */}
        <div className="bg-red-50 p-4 rounded-lg border border-red-100">
          <div className="text-sm text-red-600 font-medium mb-1">Absent</div>
          <div className="text-2xl font-bold text-red-800">{absent}</div>
          <div className="text-xs text-red-500 mt-1">
            {attendance.total > 0 ? ((absent / attendance.total) * 100).toFixed(1) : 0}% of total
          </div>
        </div>

        {/* Subjects */}
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
          <div className="text-sm text-purple-600 font-medium mb-1">Total Subjects</div>
          <div className="text-2xl font-bold text-purple-800">{totalSubjects}</div>
          <div className="text-xs text-purple-500 mt-1">This semester</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Overall Attendance Progress</span>
          <div className="flex items-center gap-2">
            <Target size={16} className="text-blue-600" />
            <span className="text-sm font-bold text-gray-800">
              {attendance.score}/{attendance.maxScore}
            </span>
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full ${
              attendance.percentage >= 80
                ? "bg-green-500"
                : attendance.percentage >= 70
                ? "bg-yellow-500"
                : "bg-red-500"
            }`}
            style={{ width: `${Math.min(attendance.percentage, 100)}%` }}
          ></div>
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-xs text-gray-500">0%</span>
          <span className="text-xs text-gray-500">Target: 80%</span>
          <span className="text-xs text-gray-500">100%</span>
        </div>
      </div>
    </div>
  );
};

export default OverallStats;