// app/dashboard/page.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/dbConnect";
import { UserRole } from "@/app/generated/prisma/enums";

export const dynamic = "force-dynamic";

const DashboardRootPage = async () => {
  try {
    // Read cookies for this request
    const cookieStore = await cookies();
    const uid = cookieStore.get("uid")?.value;

    // If there is no uid cookie => not logged in
    if (!uid) {
      redirect("/login");
    }

    // Fetch minimal user data to determine redirect
    const user = await dbConnect.user.findUnique({
      where: { id: uid },
      select: {
        id: true,
        role: true,
        isEmailVerified: true,
        isProfileComplete: true,
      },
    });

    if (!user) {
      // Invalid user ID in cookie, clear it and redirect to login
      redirect("/login");
    }

    // Check email verification
    if (!user.isEmailVerified) {
      // We don't have email here, redirect to login which will handle email verification
      redirect("/login");
    }

    // Check profile completion
    if (!user.isProfileComplete) {
      redirect("/complete-profile");
    }

    // Redirect based on role
    switch (user.role) {
      case UserRole.STUDENT:
        redirect("/dashboard/student");
      case UserRole.TEACHER:
        redirect("/dashboard/teacher");
      case UserRole.HOD:
        redirect("/dashboard/admin");
      default:
        redirect("/dashboard");
    }
  } catch (error) {
    console.error("Dashboard redirect error:", error);
    redirect("/login");
  }
};

export default DashboardRootPage;