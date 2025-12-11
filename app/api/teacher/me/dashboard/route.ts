// app/api/teacher/me/dashboard/route.ts
import dbConnect from "@/lib/dbConnect";
import { NextResponse } from "next/server";

/**
 * GET /api/teacher/me/dashboard
 *
 * Auth assumption: request is authenticated and server-side code can map
 * the request to a teacher id. For development we accept ?teacherId=... as a helper.
 */
export async function GET(req: Request) {
  try {
    // allow dev helper: ?teacherId=<id>
    const url = new URL(req.url);
    const teacherId = url.searchParams.get("teacherId");

    if (!teacherId) {
      return NextResponse.json({ error: "teacherId query param required in dev mode" }, { status: 400 });
    }

    // 1) Get teacher basic info
    const teacher = await dbConnect.teacher.findUnique({
      where: { id: teacherId },
      include: {
        user: { select: { email: true } },
        department: { select: { name: true } },
      },
    });

    if (!teacher) return NextResponse.json({ error: "Teacher not found" }, { status: 404 });

    // 2) Single SQL query to aggregate per-subject data for this teacher
    //    - total_classes: distinct class_sessions per subject
    //    - total_students: enrollments per subject
    //    - present_students: distinct students who were PRESENT at any session of the subject
    const rows: Array<{
      subject_id: string;
      subject_code: string;
      subject_name: string;
      total_classes: number;
      total_students: number;
      present_students: number;
    }> = await dbConnect.$queryRawUnsafe(`
      SELECT
        subj.id AS subject_id,
        subj.code AS subject_code,
        subj.name AS subject_name,
        COALESCE(COUNT(DISTINCT cs.id), 0) AS total_classes,
        COALESCE(COUNT(DISTINCT e."studentId"), 0) AS total_students,
        COALESCE(
          COUNT(DISTINCT ar."studentId") FILTER (WHERE ar.status = 'PRESENT'),
          0
        ) AS present_students
      FROM subjects subj
      LEFT JOIN class_sessions cs ON cs."subjectId" = subj.id
      LEFT JOIN enrollments e ON e."subjectId" = subj.id
      LEFT JOIN attendance_records ar ON ar."sessionId" = cs.id
      WHERE subj."teacherId" = $1
      GROUP BY subj.id, subj.code, subj.name
      ORDER BY subj.code;
    `, teacherId);

    // 3) Map DB rows into the JSON shape the UI expects
    const subjects = rows.map((r) => {
      const totalStudents = Number(r.total_students);
      const presentStudents = Number(r.present_students);
      const totalClasses = Number(r.total_classes);
      const attendancePercentage = totalStudents > 0
        ? Number(((presentStudents / totalStudents) * 100).toFixed(1))
        : 0;

      const status = attendancePercentage >= 80 ? "good" : attendancePercentage >= 70 ? "warning" : "critical";

      return {
        subjectId: r.subject_id,
        subjectCode: r.subject_code,
        subjectName: r.subject_name,
        totalClasses,
        totalStudents,
        presentStudents,
        attendancePercentage,
        status,
      };
    });

    // 4) Response object
    const payload = {
      teacher: {
        id: teacher.id,
        name: `${teacher.firstName} ${teacher.lastName}`,
        email: teacher.user?.email ?? null,
        department: teacher.department?.name ?? null,
      },
      subjects,
    };

    return NextResponse.json(payload, { status: 200 });
  } catch (err) {
    console.error("Teacher dashboard error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
