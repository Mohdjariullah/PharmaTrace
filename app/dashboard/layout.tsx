"use client";

import DashboardNavbar from "@/components/DashboardNavbar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <DashboardNavbar>
      {children}
    </DashboardNavbar>
  );
}