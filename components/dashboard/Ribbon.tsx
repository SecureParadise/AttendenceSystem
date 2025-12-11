// components/dashboard/Ribbon.tsx
"use client";

import { useState } from "react";
import { ChevronDown, Calendar, BookOpen } from "lucide-react";
 
interface MonthOption {
  value: string;
  label: string;
} 

interface RibbonProps {
  selectedMonth: string;
  onMonthChange: (month: string) => void;
  semesterMonths: MonthOption[];
}

const Ribbon = ({ selectedMonth, onMonthChange, semesterMonths }: RibbonProps) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const selectedMonthLabel = semesterMonths.find(m => m.value === selectedMonth)?.label || "Paush 2082";

  return (
    <div className="w-full bg-gradient-to-r from-blue-700 to-indigo-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between py-3">
          {/* Left: Title */}
          <div className="flex items-center gap-3">
            <BookOpen size={22} className="text-white" />
            <h2 className="text-lg md:text-xl font-bold text-white">
              Subject Attendance
            </h2>
          </div>

          {/* Right: Month Selector */}
          <div className="relative">
            <button
              className="flex items-center gap-2 bg-white/10 hover:bg-white/15 transition-colors px-4 py-2 rounded-lg border border-white/20"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <Calendar size={18} className="text-white" />
              <span className="text-white font-medium">{selectedMonthLabel}</span>
              <ChevronDown 
                size={18} 
                className={`text-white transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40"
                  onClick={() => setIsDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-1 z-50 w-48 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
                  <div className="py-1">
                    {semesterMonths.map((month) => (
                      <button
                        key={month.value}
                        className={`w-full text-left px-4 py-2 hover:bg-blue-50 transition-colors ${
                          selectedMonth === month.value
                            ? 'bg-blue-50 text-blue-700 font-medium'
                            : 'text-gray-700'
                        }`}
                        onClick={() => {
                          onMonthChange(month.value);
                          setIsDropdownOpen(false);
                        }}
                      >
                        {month.label}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Ribbon;