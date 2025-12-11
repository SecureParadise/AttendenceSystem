// import StudentDashboard from "@/components/dashboard_view/StudentDashboard";
import Link from "next/link";
// import React from "react";

const page = () => {
  // const studentName = "VEDAR";
  // let programName = "BEI";
  // let rollNo = "123456";
  // let semesterLabel = "8";
  // let branchLabel = "2078";
  // let heroImageSrc = "mukesh.jpg";
  // let subjects = ["tE", "OS", "C"];
  return (
    <div>
      <Link href="/signup"> Signup </Link>
      <br />
      <Link href="/login"> Login </Link>
      <br />
      <Link href="/dashboard"> Dashboard </Link>
      <br />
      <Link href="/complete-profile?role=student&email=mukeshamaresht@gmail.com">
        {" "}
        Student{" "}
      </Link>
      <br />
      <Link href="/complete-profile?role=teacher&email=mukeshamaresht@gmail.com">
        {" "}
        Teacher{" "}
      </Link>
      {/* <StudentDashboard studentName={studentName} programName={programName} rollNo={rollNo} semesterLabel={semesterLabel} branchLabel={branchLabel} heroImageSrc={heroImageSrc} subjects={subjects} /> */}
    </div>
  );
};

export default page;
