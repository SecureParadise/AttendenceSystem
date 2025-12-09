// app/(app)/signup/layout.tsx
import type { Metadata } from "next";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Signup | Campus Attendance", // 👈 tab title
  icons: {
    icon: "/wrc-logo.png", // 👈 your custom logo in public folder
  },
};

export default function SignUpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>
  {children}
  <Toaster />
  </>; // just render the page; styling is in page.tsx
}
