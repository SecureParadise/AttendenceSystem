// lib/subjectData.ts
import { generateSubjectsData, calculateOverallStats, type SubjectData } from "./attendanceLogic";

// Generate realistic data for Paush 2082
const subjectsData_rec: SubjectData[] = generateSubjectsData();

// Calculate month statistics
const monthStats = calculateOverallStats(subjectsData_rec);

export default subjectsData_rec;
export { monthStats };