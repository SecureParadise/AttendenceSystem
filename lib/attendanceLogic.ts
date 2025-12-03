// lib/attendanceLogic.ts

// Nepali month Paush 2082 has 31 days
const PAUSH_2082_DAYS = 31;
const SATURDAYS_IN_PAUSH = 4; // Assuming 4 Saturdays in Paush 2082
const PUBLIC_HOLIDAYS = 3; // Assuming 3 public holidays

// Class types
type ClassType = 'theory' | 'lab';

// Subject configuration
interface SubjectConfig {
  id: number;
  name: string;
  teacher: string;
  code?: string;
  type: ClassType;
  classesPerWeek: number;
  color: string;
}

// Generated subject data
export interface SubjectData {
  id: number;
  name: string;
  teacher: string;
  code?: string;
  totalClasses: number;
  present: number;
  absent: number;
  dp: number; // Delay Present (after 20 min)
  lp: number; // Last Present (after 45 min)
  holiday: number;
  color: string;
  attendancePercentage: number;
}

// Calculate total classes in month
const calculateTotalClasses = (type: ClassType, classesPerWeek: number): number => {
  const totalWeeks = 4; // Approximate weeks in a month
  const workingDays = PAUSH_2082_DAYS - SATURDAYS_IN_PAUSH - PUBLIC_HOLIDAYS;
  
  if (type === 'lab') {
    // Labs are once a week
    return Math.floor(workingDays / 7);
  } else {
    // Theory classes are multiple times per week
    const classesPerMonth = Math.floor((workingDays / 7) * classesPerWeek);
    return Math.min(classesPerMonth, Math.floor(workingDays / 2));
  }
};

// Generate realistic attendance data
const generateAttendanceData = (
  totalClasses: number,
  minAttendanceRate: number = 0.7,
  maxAttendanceRate: number = 0.95
): { present: number; absent: number; dp: number; lp: number } => {
  // Random attendance rate between min and max
  const attendanceRate = minAttendanceRate + Math.random() * (maxAttendanceRate - minAttendanceRate);
  
  // Total attended classes (including DP and LP)
  const totalAttended = Math.round(totalClasses * attendanceRate);
  
  // Distribute between Present, DP, and LP
  let remaining = totalAttended;
  const present = Math.round(remaining * 0.7); // 70% fully present
  remaining -= present;
  const dp = Math.round(remaining * 0.6); // 60% of remaining are DP
  remaining -= dp;
  const lp = remaining; // Rest are LP
  
  const absent = totalClasses - totalAttended;
  
  return { present, absent, dp, lp };
};

// Subject configurations based on your data
export const subjectConfigs: SubjectConfig[] = [
  {
    id: 1,
    name: "OS",
    teacher: "BP",
    type: 'theory',
    classesPerWeek: 2,
    color: "#3B82F6"
  },
  {
    id: 2,
    name: "Engineering Economics",
    teacher: "KKB",
    type: 'theory',
    classesPerWeek: 2,
    color: "#8B5CF6"
  },
  {
    id: 3,
    name: "Computer Network",
    teacher: "PA",
    type: 'theory',
    classesPerWeek: 2,
    color: "#10B981"
  },
  {
    id: 4,
    name: "Computer Architecture",
    teacher: "BHP",
    type: 'theory',
    classesPerWeek: 2,
    color: "#F59E0B"
  },
  {
    id: 5,
    name: "Filter Design",
    teacher: "BS",
    type: 'theory',
    classesPerWeek: 2,
    color: "#EF4444"
  },
  {
    id: 6,
    name: "DBMS",
    teacher: "RKC",
    type: 'theory',
    classesPerWeek: 2,
    color: "#06B6D4"
  },
  {
    id: 7,
    name: "Computer Network Lab",
    teacher: "PA",
    type: 'lab',
    classesPerWeek: 1,
    color: "#EC4899"
  },
  {
    id: 8,
    name: "DBMS Lab",
    teacher: "RKC",
    type: 'lab',
    classesPerWeek: 1,
    color: "#84CC16"
  },
  {
    id: 9,
    name: "Filter Design Lab",
    teacher: "BS",
    type: 'lab',
    classesPerWeek: 1,
    color: "#F97316"
  },
  {
    id: 10,
    name: "COA Lab",
    teacher: "BHP",
    type: 'lab',
    classesPerWeek: 1,
    color: "#6366F1"
  }
];

// Generate complete subject data
export const generateSubjectsData = (): SubjectData[] => {
  return subjectConfigs.map(config => {
    const totalClasses = calculateTotalClasses(config.type, config.classesPerWeek);
    const attendance = generateAttendanceData(totalClasses);
    const holiday = 0; // No holidays specifically for subjects
    
    const attendedClasses = attendance.present + attendance.dp + attendance.lp;
    const attendancePercentage = totalClasses > 0 
      ? Math.round((attendedClasses / (totalClasses - holiday)) * 100)
      : 0;
    
    return {
      id: config.id,
      name: config.name,
      teacher: config.teacher,
      code: config.code,
      totalClasses,
      present: attendance.present,
      absent: attendance.absent,
      dp: attendance.dp,
      lp: attendance.lp,
      holiday,
      color: config.color,
      attendancePercentage
    };
  });
};

// Calculate overall statistics
export const calculateOverallStats = (subjects: SubjectData[]) => {
  let totalPresent = 0;
  let totalAbsent = 0;
  let totalDP = 0;
  let totalLP = 0;
  let totalClasses = 0;
  
  subjects.forEach(subject => {
    totalPresent += subject.present;
    totalAbsent += subject.absent;
    totalDP += subject.dp;
    totalLP += subject.lp;
    totalClasses += subject.totalClasses;
  });
  
  const totalAttended = totalPresent + totalDP + totalLP;
  const overallPercentage = totalClasses > 0 
    ? Math.round((totalAttended / totalClasses) * 100)
    : 0;
  
  // Find best subject
  const bestSubject = subjects.reduce((best, current) => 
    current.attendancePercentage > best.attendancePercentage ? current : best
  );
  
  return {
    totalPresent,
    totalAbsent,
    totalDP,
    totalLP,
    totalClasses,
    overallPercentage,
    bestSubject: bestSubject.name,
    totalSubjects: subjects.length
  };
};