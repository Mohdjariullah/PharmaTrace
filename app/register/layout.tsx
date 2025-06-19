"use client";

import DashboardNavbar from "@/components/DashboardNavbar";

interface RegisterLayoutProps {
  children: React.ReactNode;
}

export default function RegisterLayout({ children }: RegisterLayoutProps) {
  return (
    <DashboardNavbar>
      {children}
    </DashboardNavbar>
  );
}