// components/dashboard/SubjectCard.tsx
import { BookOpen, Users, BarChart3, ChevronRight } from "lucide-react";
import Link from "next/link";

interface SubjectCardProps {
  code: string;
  name: string;
  teacher: string;
  totalClasses: number;
  totalStudents: number;
  avgAttendance: number;
  status: "good" | "warning" | "critical";
}

const SubjectCard = ({ 
  code, 
  name, 
  teacher, 
  totalClasses, 
  totalStudents, 
  avgAttendance,
  status 
}: SubjectCardProps) => {
  const statusColors = {
    good: { bg: "bg-green-100", text: "text-green-800", border: "border-green-200" },
    warning: { bg: "bg-yellow-100", text: "text-yellow-800", border: "border-yellow-200" },
    critical: { bg: "bg-red-100", text: "text-red-800", border: "border-red-200" }
  };

  const statusConfig = statusColors[status];

  return (
    <Link href={`/attendance/${code.toLowerCase()}`}>
      <div className="bg-white rounded-xl shadow-md border hover:shadow-lg hover:border-blue-300 transition-all duration-300 cursor-pointer">
        <div className="p-5">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-3 rounded-lg">
                <BookOpen size={24} className="text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-xl text-gray-800">{code}</h3>
                <p className="text-gray-600">{name}</p>
              </div>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-semibold border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}>
              {status === "good" ? "✓ Good" : status === "warning" ? "⚠ Warning" : "✗ Critical"}
            </div>
          </div>
          
          <div className="mb-4">
            <div className="flex items-center gap-2 text-gray-600 mb-2">
              <Users size={16} />
              <span className="font-medium">Teacher: {teacher}</span>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="text-center p-2 bg-gray-50 rounded-lg">
              <div className="text-lg font-bold text-gray-800">{totalClasses}</div>
              <div className="text-xs text-gray-600">Classes</div>
            </div>
            <div className="text-center p-2 bg-gray-50 rounded-lg">
              <div className="text-lg font-bold text-gray-800">{totalStudents}</div>
              <div className="text-xs text-gray-600">Students</div>
            </div>
            <div className="text-center p-2 bg-gray-50 rounded-lg">
              <div className={`text-lg font-bold ${
                avgAttendance >= 80 ? "text-green-600" :
                avgAttendance >= 70 ? "text-yellow-600" : "text-red-600"
              }`}>
                {avgAttendance}%
              </div>
              <div className="text-xs text-gray-600">Avg. Attendance</div>
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <BarChart3 size={16} />
              <span>View Attendance Sheet</span>
            </div>
            <ChevronRight size={20} className="text-gray-400" />
          </div>
        </div>
      </div>
    </Link>
  );
};

export default SubjectCard;