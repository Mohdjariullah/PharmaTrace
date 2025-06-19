"use client";

import DashboardNavbar from "@/components/DashboardNavbar";

interface VerifyLayoutProps {
  children: React.ReactNode;
}

export default function VerifyLayout({ children }: VerifyLayoutProps) {
  return (
    <DashboardNavbar>
      {children}
    </DashboardNavbar>
  );
}