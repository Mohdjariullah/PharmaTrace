"use client";

import DashboardNavbar from "@/components/DashboardNavbar";

interface ScanLayoutProps {
  children: React.ReactNode;
}

export default function ScanLayout({ children }: ScanLayoutProps) {
  return (
    <DashboardNavbar>
      {children}
    </DashboardNavbar>
  );
}