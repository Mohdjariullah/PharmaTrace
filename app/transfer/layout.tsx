"use client";

import DashboardNavbar from "@/components/DashboardNavbar";

interface TransferLayoutProps {
  children: React.ReactNode;
}

export default function TransferLayout({ children }: TransferLayoutProps) {
  return (
    <DashboardNavbar>
      {children}
    </DashboardNavbar>
  );
}