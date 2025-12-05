// app/(admin)/attendance/[subject]/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import {
  Save,
  Download,
  Search,
  ChevronLeft,
  ChevronRight,
  User,
  Calendar,
  BookOpen,
  BarChart3,
  Check,
  X,
  Edit2,
  EyeOff,
  Eye,
} from "lucide-react";
import Image from "next/image";

// Mock student data
const mockStudents = [
  { rollNo: "PAS078BEI01", name: "AAGAMAN KC" },
  { rollNo: "PAS078BEI02", name: "AJAY PANTA" },
  { rollNo: "PAS078BEI03", name: "AMRIT KUMAR BANJADE" },
  { rollNo: "PAS078BEI04", name: "ANIL POUDEL" },
  { rollNo: "PAS078BEI05", name: "ANISHA BHANDARI" },
  { rollNo: "PAS078BEI06", name: "ANURAG ACHARYA" },
  { rollNo: "PAS078BEI07", name: "ARUN CHANDRA BHUSAL" },
  { rollNo: "PAS078BEI08", name: "BHUPENDRA SINGH" },
  { rollNo: "PAS078BEI09", name: "BINAY NEPALI" },
  { rollNo: "PAS078BEI10", name: "CHANDRA KAMAL SINGH" },
  { rollNo: "PAS078BEI11", name: "DAVID BHATTAKAI" },
  { rollNo: "PAS078BEI12", name: "DHIRAJ KUMAR CHAURASIYA" },
  { rollNo: "PAS078BEI13", name: "GANESH ROKAYA" },
  { rollNo: "PAS078BEI14", name: "GAURAV BHUJEL" },
  { rollNo: "PAS078BEI15", name: "GOVIND KUMAR YADAV" },
  { rollNo: "PAS078BEI16", name: "KALPANA ACHARYA" },
  { rollNo: "PAS078BEI17", name: "KIRAN POUDEL" },
  { rollNo: "PAS078BEI18", name: "LAXMI PRASAD UPADHYAYA" },
  { rollNo: "PAS078BEI19", name: "MANILA TIMILSINA" },
  { rollNo: "PAS078BEI20", name: "MANISH ACHARYA" },
  { rollNo: "PAS078BEI21", name: "MANJIL THAPA" },
  { rollNo: "PAS078BEI22", name: "MIJASH BHUGAI" },
  { rollNo: "PAS078BEI23", name: "MUKESH AMARESH THAKUR" },
  { rollNo: "PAS078BEI24", name: "NABIN SHRESTHA" },
  { rollNo: "PAS078BEI25", name: "PRABIN THAPA" },
  { rollNo: "PAS078BEI26", name: "PRASHANTA UPADHYAYA" },
  { rollNo: "PAS078BEI27", name: "ROHIT KUMAR SAH" },
  { rollNo: "PAS078BEI28", name: "ROHIN PURI" },
  { rollNo: "PAS078BEI29", name: "ROSHAN THAPA" },
  { rollNo: "PAS078BEI30", name: "RUJAN SUBEDI" },
  { rollNo: "PAS078BEI31", name: "SAANGE TAMANG" },
  { rollNo: "PAS078BEI32", name: "SAGAR JOSHI" },
  { rollNo: "PAS078BEI33", name: "SAGAR PAUDEL" },
  { rollNo: "PAS078BEI34", name: "SANJOG SAPKOTA" },
  { rollNo: "PAS078BEI35", name: "SANTOSH KUMAR BARAI" },
  { rollNo: "PAS078BEI36", name: "SATISH GAUTAM" },
  { rollNo: "PAS078BEI37", name: "SHARON ADHIKARI" },
  { rollNo: "PAS078BEI38", name: "SIDDHARTHA GUPTA" },
  { rollNo: "PAS078BEI39", name: "SUBINA CHHETRI" },
  { rollNo: "PAS078BEI40", name: "SUCHANA SUBEDI" },
  { rollNo: "PAS078BEI41", name: "SULAV KANDEL" },
  { rollNo: "PAS078BEI42", name: "SUMIT SIGDEL" },
  { rollNo: "PAS078BEI43", name: "SWOSTIKA POUDEL" },
  { rollNo: "PAS078BEI44", name: "UMA NATH THAKUR" },
  { rollNo: "PAS078BEI45", name: "UMMESH SUBEDI" },
  { rollNo: "PAS078BEI46", name: "UPENDRA RAJ JOSHI" },
  { rollNo: "PAS078BEI47", name: "UTKARSHA GUPTA" },
  { rollNo: "PAS078BEI48", name: "SRIYANKA BARAL" },
];

// Mock attendance dates
const mockDates = [
  { date: "6thdec2025", day: "Mon" },
  { date: "8thdec2025", day: "Wed" },
  { date: "10thdec2026", day: "Thu" },
  { date: "12thdec2027", day: "Fri" },
  { date: "18thdec2028", day: "Mon" },
  { date: "20thdec2029", day: "Tue" },
  { date: "25thdec2030", day: "Wed" },
];

// Generate random attendance data
const generateRandomAttendance = () => {
  const data: Record<string, Record<string, string>> = {};

  mockStudents.forEach((student) => {
    data[student.rollNo] = {};
    mockDates.forEach((dateObj) => {
      const rand = Math.random();
      if (rand < 0.75) data[student.rollNo][dateObj.date] = "P";
      else if (rand < 0.9) data[student.rollNo][dateObj.date] = "DP";
      else if (rand < 0.97) data[student.rollNo][dateObj.date] = "LP";
      else data[student.rollNo][dateObj.date] = "A";
    });
  });

  return data;
};

const AttendanceSheetAdmin_view = () => {
  const [attendanceData, setAttendanceData] = useState<
    Record<string, Record<string, string>>
  >({});
  const [searchQuery, setSearchQuery] = useState("");
  const [horizontalScroll, setHorizontalScroll] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedCell, setSelectedCell] = useState<{
    studentId: string;
    date: string;
  } | null>(null);
  const [recentlyUpdated, setRecentlyUpdated] = useState<Set<string>>(
    new Set()
  );
  const [showPercentage, setShowPercentage] = useState(true);
  const tableContainerRef = useRef<HTMLDivElement>(null);

  // Initialize data
  useEffect(() => {
    setAttendanceData(generateRandomAttendance());
  }, []);

  // Calculate statistics for a student
  const calculateStudentStats = (studentId: string) => {
    const studentData = attendanceData[studentId];
    if (!studentData)
      return { present: 0, delayed: 0, late: 0, absent: 0, percentage: 0 };

    let present = 0,
      delayed = 0,
      late = 0,
      absent = 0;

    Object.values(studentData).forEach((status) => {
      if (status === "P") present++;
      else if (status === "DP") delayed++;
      else if (status === "LP") late++;
      else if (status === "A") absent++;
    });

    const totalClasses = mockDates.length;
    const weightedScore =
      present * 1.0 + delayed * 0.8 + late * 0.6 + absent * 0;
    const percentage =
      totalClasses > 0 ? (weightedScore / totalClasses) * 100 : 0;

    return {
      present,
      delayed,
      late,
      absent,
      percentage: parseFloat(percentage.toFixed(1)),
    };
  };

  // Calculate overall statistics
  const calculateOverallStats = () => {
    const totalStudents = mockStudents.length;
    const totalClasses = mockDates.length;
    let totalWeightedScore = 0;
    let warningCount = 0;
    let criticalCount = 0;

    mockStudents.forEach((student) => {
      const stats = calculateStudentStats(student.rollNo);
      totalWeightedScore +=
        stats.present * 1.0 + stats.delayed * 0.8 + stats.late * 0.6;

      if (stats.percentage < 70) {
        criticalCount++;
      } else if (stats.percentage < 80) {
        warningCount++;
      }
    });

    const avgAttendance =
      totalStudents > 0
        ? (totalWeightedScore / (totalStudents * totalClasses)) * 100
        : 0;

    return {
      totalClasses,
      totalStudents,
      avgAttendance: parseFloat(avgAttendance.toFixed(1)),
      warningAttendance: warningCount,
      criticalAttendance: criticalCount,
    };
  };

  const overallStats = calculateOverallStats();

  // Filter students based on search
  const filteredStudents = mockStudents.filter(
    (student) =>
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.rollNo.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle cell click for editing
  const handleCellClick = (studentId: string, date: string) => {
    if (isEditing) {
      setSelectedCell({ studentId, date });
    }
  };

  // Update attendance status
  const updateAttendance = (
    studentId: string,
    date: string,
    status: string
  ) => {
    const cellKey = `${studentId}-${date}`;
    setRecentlyUpdated((prev) => new Set([...prev, cellKey]));

    setAttendanceData((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [date]: status,
      },
    }));

    // Auto-switch back to normal view after 300ms
    setTimeout(() => {
      setSelectedCell(null);
    }, 300);
  };

  // Calculate max scroll position
  const calculateMaxScroll = () => {
    if (tableContainerRef.current) {
      const containerWidth = tableContainerRef.current.clientWidth;
      const tableWidth = tableContainerRef.current.scrollWidth;
      return Math.max(0, tableWidth - containerWidth);
    }
    return 0;
  };

  // Handle horizontal scroll
  const scrollLeft = () => {
    setHorizontalScroll((prev) => Math.max(0, prev - 100));
  };

  const scrollRight = () => {
    const maxScroll = calculateMaxScroll();
    setHorizontalScroll((prev) => Math.min(maxScroll, prev + 100));
  };

  // Export to Excel
  const handleExport = () => {
    alert("Export functionality would be implemented here");
  };

  // Save changes
  const handleSave = () => {
    setIsEditing(false);
    setRecentlyUpdated(new Set());
    alert("Attendance saved successfully!");
  };

  // Cancel editing
  const handleCancel = () => {
    setIsEditing(false);
    setSelectedCell(null);
  };

  // Get cell style based on status
  const getCellStyle = (status: string) => {
    switch (status) {
      case "P":
        return "bg-green-100 text-green-800 border-green-300";
      case "DP":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "LP":
        return "bg-orange-100 text-orange-800 border-orange-300";
      case "A":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-500 border-gray-300";
    }
  };

  // Get percentage style based on value
  const getPercentageStyle = (percentage: number) => {
    if (percentage >= 80) return "bg-green-50 text-green-700";
    if (percentage >= 70) return "bg-yellow-50 text-yellow-700";
    return "bg-red-50 text-red-700";
  };

  return (
    <div className=" min-h-screen bg-linear-to-br from-blue-50 via-white to-indigo-50">
      {/* Compact Header Ribbon */}
      <div className="sticky top-0 z-50 bg-linear-to-r from-blue-800 via-indigo-800 to-purple-800 text-white shadow-xl">
        <div className="max-w-full mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between py-6 gap-6">
            {/* Left: Beautiful Circular WRC Logo */}
            <div className="flex items-center gap-4">
              {/* Circular Logo Container */}
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur opacity-70 group-hover:opacity-100 transition-all duration-300"></div>
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-white/30 bg-white/10 backdrop-blur-sm p-2 shadow-2xl">
                  <div className="w-full h-full rounded-full overflow-hidden border-2 border-white/40 bg-white flex items-center justify-center">
                    <Image
                      src="/wrc-logo.png"
                      alt="WRC Logo"
                      width={96}
                      height={96}
                      className="w-full h-full object-contain p-3"
                      priority
                    />
                  </div>
                </div>
              </div>

              {/* University Info */}
              <div className="text-left">
                <h1 className="">Western Regional Campus</h1>
                <div className="h-1 w-16 bg-linear-to-r from-blue-400 to-purple-400 my-2 rounded-full"></div>
                <p className="text-blue-200 text-sm sm:text-base">
                  Tribhuvan University
                </p>
                <p className="text-blue-300/90 text-xs sm:text-sm">
                  Pashchimanchal Campus, Pokhara
                </p>
              </div>
            </div>

            {/* Right: Subject Info - Clean and Simple */}
            <div className="text-center sm:text-right">
              <h1 className="text-xl sm:text-2xl font-bold">
                Operating Systems (OS)
              </h1>
              <div className="flex flex-wrap justify-center sm:justify-end items-center gap-3 mt-1">
                <div className="flex items-center gap-2">
                  <User size={14} className="text-blue-200" />
                  <span className="text-sm text-blue-100">Teacher: BP </span>
                  {/* the below line is not working  */}
                  {/* <span className="text-sm text-blue-100">Teacher: {teacher} </span> */}
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-blue-200" />
                  <span className="text-sm text-blue-100">5th Semester</span>
                </div>
                <div className="flex items-center gap-2">
                  <BarChart3 size={14} className="text-blue-200" />
                  <span className="text-sm text-blue-100">
                    {overallStats.totalClasses} Classes
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="sticky top-16 z-40 bg-white border-b">
        <div className="max-w-full mx-auto px-4 py-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Left: Search and Controls */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-none sm:w-64">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Search student..."
                  className="pl-10 pr-4 py-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`px-3 py-2 rounded-lg font-medium text-sm flex items-center gap-2 ${
                  isEditing
                    ? "bg-green-100 text-green-700 border border-green-300"
                    : "bg-blue-100 text-blue-700 border border-blue-300"
                }`}
              >
                {isEditing ? (
                  <>
                    <Check size={16} />
                    <span>Editing</span>
                  </>
                ) : (
                  <>
                    <Edit2 size={16} />
                    <span>Edit</span>
                  </>
                )}
              </button>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowPercentage(!showPercentage)}
                className="px-3 py-2 rounded-lg bg-gray-100 text-gray-700 border border-gray-300 text-sm flex items-center gap-2"
                title={showPercentage ? "Hide Percentage" : "Show Percentage"}
              >
                {showPercentage ? <EyeOff size={16} /> : <Eye size={16} />}
                <span>{showPercentage ? "Hide %" : "Show %"}</span>
              </button>
              <button
                onClick={handleSave}
                className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm flex items-center gap-2"
              >
                <Save size={16} />
                <span>Save</span>
              </button>
              <button
                onClick={handleExport}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm flex items-center gap-2"
              >
                <Download size={16} />
                <span>Export</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Compact Excel-like Sheet */}
      <div className="max-w-full mx-auto px-2 sm:px-4 py-4">
        {/* Quick Stats */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div>
              <span className="font-medium">
                Showing {filteredStudents.length} of {mockStudents.length}{" "}
                students
              </span>
              {recentlyUpdated.size > 0 && (
                <span className="ml-3 text-green-600">
                  • {recentlyUpdated.size} update
                  {recentlyUpdated.size === 1 ? "" : "s"}
                </span>
              )}
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-green-100 border border-green-300"></div>
                <span>Avg: {overallStats.avgAttendance}%</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-yellow-100 border border-yellow-300"></div>
                <span>Warning: {overallStats.warningAttendance}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-red-100 border border-red-300"></div>
                <span>Critical: {overallStats.criticalAttendance}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Excel-like Attendance Sheet */}
        <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
          {/* Scroll Controls */}
          <div className="flex items-center justify-between px-4 py-2 border-b bg-gray-50">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm text-gray-700">
                Attendance Dates
              </span>
              <div className="flex gap-1">
                <button
                  onClick={scrollLeft}
                  disabled={horizontalScroll === 0}
                  className="p-1 rounded border bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Scroll left"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={scrollRight}
                  disabled={horizontalScroll >= calculateMaxScroll()}
                  className="p-1 rounded border bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Scroll right"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
            <div className="text-xs text-gray-500">
              Total Classes: {overallStats.totalClasses}
            </div>
          </div>

          {/* Attendance Table - Excel Style */}
          <div
            className="overflow-x-auto max-h-[calc(100vh-280px)]"
            ref={tableContainerRef}
          >
            <div
              className="min-w-max"
              style={{ transform: `translateX(-${horizontalScroll}px)` }}
            >
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    {/* Fixed Columns */}
                    <th className="sticky left-0 z-20 bg-gray-50 border-r border-b p-3 text-left font-semibold text-gray-700 min-w-[100px]">
                      Roll No
                    </th>
                    <th className="sticky left-[100px] z-20 bg-gray-50 border-r border-b p-3 text-left font-semibold text-gray-700 min-w-[180px]">
                      Student Name
                    </th>

                    {/* Date Columns */}
                    {mockDates.map((dateObj) => (
                      <th
                        key={dateObj.date}
                        className="border-r border-b p-2 text-center font-medium text-gray-700 min-w-[70px]"
                      >
                        <div>{dateObj.day}</div>
                        <div className="text-xs text-gray-500 font-normal">
                          {dateObj.date}
                        </div>
                      </th>
                    ))}

                    {/* Summary Columns */}
                    <th className="border-r border-b p-2 text-center bg-green-50 font-semibold text-green-700 min-w-[50px]">
                      P
                    </th>
                    <th className="border-r border-b p-2 text-center bg-yellow-50 font-semibold text-yellow-700 min-w-[50px]">
                      DP
                    </th>
                    <th className="border-r border-b p-2 text-center bg-orange-50 font-semibold text-orange-700 min-w-[50px]">
                      LP
                    </th>
                    <th className="border-r border-b p-2 text-center bg-red-50 font-semibold text-red-700 min-w-[50px]">
                      A
                    </th>

                    {/* Percentage Column - Only show if enabled */}
                    {showPercentage && (
                      <th className="border-b p-2 text-center bg-blue-50 font-semibold text-blue-700 min-w-[80px] sticky right-0 z-20">
                        % Attendance
                      </th>
                    )}
                  </tr>
                </thead>

                <tbody>
                  {filteredStudents.map((student, rowIndex) => {
                    const stats = calculateStudentStats(student.rollNo);
                    const isEven = rowIndex % 2 === 0;

                    return (
                      <tr
                        key={student.rollNo}
                        className={`${
                          isEven ? "bg-white" : "bg-gray-50/30"
                        } hover:bg-gray-100`}
                      >
                        {/* Fixed Columns */}
                        <td className="sticky left-0 z-10 bg-white border-r p-3 font-mono text-gray-800 text-xs">
                          {student.rollNo}
                        </td>
                        <td className="sticky left-[100px] z-10 bg-white border-r p-3 text-gray-800 text-sm truncate max-w-[180px]">
                          {student.name}
                        </td>

                        {/* Date Cells - Compact Excel Style */}
                        {mockDates.map((dateObj) => {
                          const status =
                            attendanceData[student.rollNo]?.[dateObj.date] ||
                            "-";
                          const isCellSelected =
                            selectedCell?.studentId === student.rollNo &&
                            selectedCell?.date === dateObj.date;
                          const cellKey = `${student.rollNo}-${dateObj.date}`;
                          const isUpdated = recentlyUpdated.has(cellKey);

                          return (
                            <td
                              key={`${student.rollNo}-${dateObj.date}`}
                              className={`border-r p-2 text-center cursor-pointer transition-colors ${
                                isCellSelected
                                  ? "ring-1 ring-blue-500 bg-blue-50"
                                  : ""
                              } ${isUpdated ? "ring-1 ring-green-500" : ""}`}
                              onClick={() =>
                                handleCellClick(student.rollNo, dateObj.date)
                              }
                            >
                              {isCellSelected && isEditing ? (
                                <div className="grid grid-cols-2 gap-1">
                                  {["P", "DP", "LP", "A"].map((option) => {
                                    const isCurrent = status === option;
                                    return (
                                      <button
                                        key={option}
                                        className={`p-1 text-xs font-medium rounded border ${
                                          option === "P"
                                            ? `${
                                                isCurrent
                                                  ? "bg-green-600 text-white"
                                                  : "bg-green-50 text-green-700 border-green-300"
                                              }`
                                            : option === "DP"
                                            ? `${
                                                isCurrent
                                                  ? "bg-yellow-600 text-white"
                                                  : "bg-yellow-50 text-yellow-700 border-yellow-300"
                                              }`
                                            : option === "LP"
                                            ? `${
                                                isCurrent
                                                  ? "bg-orange-600 text-white"
                                                  : "bg-orange-50 text-orange-700 border-orange-300"
                                              }`
                                            : `${
                                                isCurrent
                                                  ? "bg-red-600 text-white"
                                                  : "bg-red-50 text-red-700 border-red-300"
                                              }`
                                        }`}
                                        onClick={() =>
                                          updateAttendance(
                                            student.rollNo,
                                            dateObj.date,
                                            option
                                          )
                                        }
                                      >
                                        {option}
                                      </button>
                                    );
                                  })}
                                </div>
                              ) : (
                                <div
                                  className={`
                                  p-1 rounded border ${getCellStyle(status)}
                                  ${isUpdated ? "animate-pulse-once" : ""}
                                `}
                                >
                                  <span className="font-bold">{status}</span>
                                </div>
                              )}
                            </td>
                          );
                        })}

                        {/* Summary Cells - Compact */}
                        <td className="border-r p-2 text-center bg-green-50/30">
                          <div className="font-semibold text-green-700">
                            {stats.present}
                          </div>
                        </td>
                        <td className="border-r p-2 text-center bg-yellow-50/30">
                          <div className="font-semibold text-yellow-700">
                            {stats.delayed}
                          </div>
                        </td>
                        <td className="border-r p-2 text-center bg-orange-50/30">
                          <div className="font-semibold text-orange-700">
                            {stats.late}
                          </div>
                        </td>
                        <td className="border-r p-2 text-center bg-red-50/30">
                          <div className="font-semibold text-red-700">
                            {stats.absent}
                          </div>
                        </td>

                        {/* Percentage Column - Only show if enabled */}
                        {showPercentage && (
                          <td
                            className={`p-2 text-center font-bold sticky right-0 z-10 ${getPercentageStyle(
                              stats.percentage
                            )}`}
                          >
                            {stats.percentage}%
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Legend and Info Bar */}
        <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          {/* Legend */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded-sm bg-green-100 border border-green-300 flex items-center justify-center">
                <span className="font-bold text-green-700 text-xs">P</span>
              </div>
              <span className="text-gray-600">Present (1.0)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded-sm bg-yellow-100 border border-yellow-300 flex items-center justify-center">
                <span className="font-bold text-yellow-700 text-xs">DP</span>
              </div>
              <span className="text-gray-600">Delayed (0.8)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded-sm bg-orange-100 border border-orange-300 flex items-center justify-center">
                <span className="font-bold text-orange-700 text-xs">LP</span>
              </div>
              <span className="text-gray-600">Late (0.6)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded-sm bg-red-100 border border-red-300 flex items-center justify-center">
                <span className="font-bold text-red-700 text-xs">A</span>
              </div>
              <span className="text-gray-600">Absent (0.0)</span>
            </div>
          </div>

          {/* Status Info */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-gray-600">Good (≥80%)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span className="text-gray-600">Warning (70-79%)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-gray-600">Critical (&lt;70%)</span>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start gap-2">
            <BookOpen size={16} className="text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm text-blue-800 font-medium">Instructions</p>
              <p className="text-xs text-blue-600">
                • Click the <strong>Edit</strong> button to enable editing •
                Click any attendance cell to change status • Changes are saved
                when you click <strong>Save</strong> • Use{" "}
                <strong>Export</strong> to download Excel file
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Add CSS for pulse animation */}
      <style jsx>{`
        @keyframes pulse-once {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
          100% {
            transform: scale(1);
          }
        }
        .animate-pulse-once {
          animation: pulse-once 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default AttendanceSheetAdmin_view;
