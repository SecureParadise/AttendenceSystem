import dbConnect from "@/lib/dbConnect";
import { NextResponse } from "next/server";
// import dbConnect from "@/lib/dbConnect"; // your configured dbConnectClient

export async function GET(req: Request) {
  try {
    // 1. Get logged-in user ID from token (for now use hard-coded for dev)
    const student = await dbConnect.student.findFirst({
      where: { rollNo: "PAS078BEI023" }, // replace with auth later
      include: {
        branch: true,
        currentSemester: true,
        attendanceRecords: {
          include: { session: { include: { subject: true } } }
        }
      }
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // 2. Get all subjects for current semester
    const subjects = await dbConnect.subject.findMany({
      where: {
        branchId: student.branchId,
        semesterId: student.currentSemesterId!,
      },
      include: { teacher: true }
    });

    // 3. Aggregate attendance per subject
    const grouped: Record<string, any> = {};

    student.attendanceRecords.forEach((rec) => {
      const s = rec.session.subject;
      if (!grouped[s.id]) {
        grouped[s.id] = {
          totalClasses: 0,
          present: 0,
          delayedPresent: 0,
          latePresent: 0,
          absent: 0,
        };
      }

      grouped[s.id].totalClasses++;

      if (rec.status === "PRESENT") grouped[s.id].present++;
      else if (rec.status === "LATE") grouped[s.id].delayedPresent++;
      else if (rec.status === "VERY_LATE") grouped[s.id].latePresent++;
      else if (rec.status === "ABSENT") grouped[s.id].absent++;
    });

    // 4. Prepare final cleaned response
    const output = {
      student: {
        id: student.id,
        name: `${student.firstName} ${student.middleName ?? ""} ${student.lastName}`,
        rollNo: student.rollNo,
        semester: student.currentSemester?.number,
        branch: student.branch.name,
      },

      subjects: subjects.map((s) => {
        const att = grouped[s.id] || {
          totalClasses: 0,
          present: 0,
          delayedPresent: 0,
          latePresent: 0,
          absent: 0,
        };

        const weighted =
          att.present * 1 +
          att.delayedPresent * 0.8 +
          att.latePresent * 0.6;

        const percentage =
          att.totalClasses > 0
            ? Number(((weighted / att.totalClasses) * 100).toFixed(1))
            : 0;

        const status =
          percentage >= 80
            ? "good"
            : percentage >= 70
            ? "warning"
            : "critical";

        return {
          subjectId: s.id,
          subjectCode: s.code,
          subjectName: s.name,
          teacher: `${s.teacher.firstName} ${s.teacher.lastName}`,
          totalClasses: att.totalClasses,
          present: att.present,
          delayedPresent: att.delayedPresent,
          latePresent: att.latePresent,
          absent: att.absent,
          weightedScore: Number(weighted.toFixed(2)),
          maxPossibleScore: att.totalClasses,
          attendancePercentage: percentage,
          status,
        };
      }),
    };

    return NextResponse.json(output, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
