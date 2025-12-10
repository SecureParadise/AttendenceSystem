import Link from "next/link";
import React from "react";

const page = () => {
  return (
    <div>
      <Link href="/signup"> Signup </Link>
      <br />
      <Link href="/login"> Login </Link>
      <br />
      <Link href="/dashboard"> Dashboard </Link>
      <br />
      <Link href="/complete-profile?role=student&email=mukeshamaresht@gmail.com"> Student </Link>
      <br />
      <Link href="/complete-profile?role=teacher&email=mukeshamaresht@gmail.com"> Teacher </Link>
    </div>
  );
};

export default page;
