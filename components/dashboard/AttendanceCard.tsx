// components/dashboard/AttendanceCard.tsx
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { BookOpen, User } from "lucide-react";

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

interface AttendanceCardProps {
  subject: SubjectAttendance;
}

const AttendanceCard = ({ subject }: SubjectAttendance) => {
  // Prepare data for mini pie chart
  const chartData = [
    { name: "P", value: subject.present, color: "#10B981" },
    { name: "DP", value: subject.delayedPresent, color: "#F59E0B" },
    { name: "LP", value: subject.latePresent, color: "#F97316" },
    { name: "A", value: subject.absent, color: "#EF4444" },
  ];

  // Status badge styling
  const getStatusBadge = () => {
    switch(subject.status) {
      case "good":
        return {
          bg: "bg-green-100",
          text: "text-green-800",
          border: "border-green-200",
          icon: "✓"
        };
      case "warning":
        return {
          bg: "bg-yellow-100",
          text: "text-yellow-800",
          border: "border-yellow-200",
          icon: "⚠"
        };
      case "critical":
        return {
          bg: "bg-red-100",
          text: "text-red-800",
          border: "border-red-200",
          icon: "✗"
        };
    }
  };

  const statusBadge = getStatusBadge();

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 hover:shadow-lg hover:border-blue-200 transition-all duration-300 h-full">
      <div className="p-4 h-full flex flex-col">
        {/* Card Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <BookOpen size={16} className="text-blue-600 shrink-0" />
              <h3 className="font-bold text-gray-800 truncate">
                {subject.subjectCode}
              </h3>
            </div>
            <p className="text-sm text-gray-600 truncate mb-1">
              {subject.subjectName}
            </p>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <User size={12} className="shrink-0" />
              <span className="truncate">{subject.teacher}</span>
            </div>
          </div>
          
          {/* Status Badge */}
          <div className={`${statusBadge.bg} ${statusBadge.text} ${statusBadge.border} 
            px-2 py-1 rounded-full text-xs font-medium border shrink-0 ml-2`}>
            {statusBadge.icon} {subject.status.toUpperCase()}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 grid grid-cols-2 gap-3 mb-3">
          {/* Pie Chart */}
          <div className="h-28">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={15}
                  outerRadius={28}
                  paddingAngle={1}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            
          </div>

          {/* Stats */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600">Classes:</span>
              <span className="font-bold text-gray-800">
                {subject.totalClasses}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-green-600">Score:</span>
              <span className="font-bold text-green-700">
                {subject.weightedScore}/{subject.maxPossibleScore}
              </span>
            </div>
            <div className="bg-gray-50 p-2 rounded-lg">
              <div className="text-xs font-medium text-gray-700 mb-1">
                Attendance Count
              </div>
              <div className="grid grid-cols-2 gap-1 text-xs text-gray-600">
                <div>P: {subject.present}</div>
                <div>DP: {subject.delayedPresent}</div>
                <div>LP: {subject.latePresent}</div>
                <div>A: {subject.absent}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer with Percentage */}
        <div className="pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-gray-600">Attendance:</span>
            <span className={`font-bold text-lg ${
              subject.attendancePercentage >= 80
                ? "text-green-600"
                : subject.attendancePercentage >= 70
                ? "text-yellow-600"
                : "text-red-600"
            }`}>
              {subject.attendancePercentage.toFixed(1)}%
            </span>
          </div>
          
          {/* Progress Bar */}
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
  );
};

export default AttendanceCard;