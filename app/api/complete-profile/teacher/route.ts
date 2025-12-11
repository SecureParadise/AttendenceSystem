// app/api/complete-profile/teacher/route.ts
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";

type Body = {
  email?: string;
  cardNo?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  designation?: string;
  departmentId?: string;   // preferred: DB id
  departmentKey?: string;  // fallback: client static key like "dept_electrical"
  departmentLabel?: string;
  specialization?: string;
};

function normalize(s?: string) {
  if (!s) return "";
  return String(s).toLowerCase().replace(/[^a-z0-9]+/g, "");
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;

    // Basic validation
    if (!body.email) return NextResponse.json({ error: "email is required" }, { status: 400 });
    if (!body.cardNo || !body.firstName || !body.lastName || !body.designation) {
      return NextResponse.json(
        { error: "cardNo, firstName, lastName and designation are required" },
        { status: 400 }
      );
    }

    const { email, cardNo, firstName, middleName, lastName, designation, departmentId, departmentKey, departmentLabel, specialization } = body;

    // Load departments from DB once (no strict select to avoid schema problems)
    const departments = await dbConnect.department.findMany({ orderBy: { name: "asc" } });

    // Try to resolve department
    let resolvedDept = null as any | null;

    // 1) If departmentId provided, prefer it
    if (departmentId) {
      resolvedDept = departments.find((d: any) => String(d.id) === String(departmentId));
    }

    // 2) If not resolved and departmentKey provided, attempt tolerant matching
    if (!resolvedDept && departmentKey) {
      // remove common prefix like "dept", "department", underscores and non-alnum
      const keyRaw = normalize(departmentKey);
      const keyStripped = keyRaw.replace(/^(dept|department)/, "");
      // compute normalized name for each dept and try to match
      resolvedDept = departments.find((d: any) => {
        const nameNorm = normalize(d.name ?? (d as any).label ?? (d as any).code ?? d.id);
        // exact id/key match
        if (String(d.id) === departmentKey || String(d.id) === keyRaw) return true;
        // some DBs may have 'code' or 'key' fields - compare them defensively
        const code = normalize((d as any).code ?? (d as any).key ?? (d as any).value ?? "");
        if (code && (code === keyRaw || code === keyStripped)) return true;
        // substring match: if normalized name contains the stripped key (e.g., 'electrical')
        if (keyStripped && nameNorm.includes(keyStripped)) return true;
        // also check if name contains full keyRaw (fallback)
        if (keyRaw && nameNorm.includes(keyRaw)) return true;
        return false;
      });
    }

    // 3) If still not resolved and departmentLabel provided, attempt matching by label
    if (!resolvedDept && departmentLabel) {
      const labelNorm = normalize(departmentLabel);
      resolvedDept = departments.find((d: any) => normalize(d.name ?? (d as any).label ?? "").includes(labelNorm));
    }

    // If still not found, return helpful 400 with available departments
    if (!resolvedDept) {
      const simplified = departments.map((d: any) => ({ id: d.id, name: d.name ?? d.code ?? String(d.id) }));
      return NextResponse.json(
        {
          error: "Invalid department selected.",
          hint: "Server could not resolve the provided departmentId/departmentKey. Use one of these department ids (preferred) or make your key match the name.",
          received: { departmentId, departmentKey, departmentLabel },
          availableDepartments: simplified,
        },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await dbConnect.user.findUnique({ where: { email } });
    if (!user) return NextResponse.json({ error: "User with provided email not found." }, { status: 404 });

    // Upsert Teacher (your schema uses Teacher model)
    const teacher = await dbConnect.teacher.upsert({
      where: { userId: user.id },
      update: {
        cardNo,
        firstName,
        middleName: middleName ?? null,
        lastName,
        designation,
        departmentId: resolvedDept.id, // write FK directly
        specialization: specialization ?? null,
      },
      create: {
        user: { connect: { id: user.id } },
        cardNo,
        firstName,
        middleName: middleName ?? null,
        lastName,
        designation,
        department: { connect: { id: resolvedDept.id } },
        specialization: specialization ?? null,
      },
    });

    return NextResponse.json({ ok: true, message: "Teacher profile saved.", teacher, department: { id: resolvedDept.id, name: resolvedDept.name ?? null } });
  } catch (err) {
    console.error("/api/complete-profile/teacher error:", err);
    return NextResponse.json({ error: "Internal server error", detail: (err as Error).message }, { status: 500 });
  }
}
