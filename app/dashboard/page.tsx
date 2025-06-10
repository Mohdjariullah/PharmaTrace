"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, Package, Scan, Repeat, BarChart3, AlertTriangle, Calendar } from "lucide-react";
import Link from "next/link";
import { getBatchStats } from "@/services/supabaseService";
import { useWalletContext } from "@/components/WalletProvider";

export default function DashboardPage() {
  const [stats, setStats] = useState<{
    total: number;
    flagged: number;
    expired: number;
    pendingTransfer: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const { connected } = useWalletContext();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await getBatchStats();
        setStats(data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="space-y-8">
      <PageHeader
        heading="Dashboard"
        text="Monitor your pharmaceutical supply chain at a glance"
      />

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Batches"
          value={stats?.total}
          loading={loading}
          icon={Package}
          description="Registered in the system"
          className="bg-primary/10"
        />
        
        <StatsCard
          title="Pending Transfer"
          value={stats?.pendingTransfer}
          loading={loading}
          icon={Repeat}
          description="Awaiting transfer"
          className="bg-blue-500/10"
        />
        
        <StatsCard
          title="Flagged Batches"
          value={stats?.flagged}
          loading={loading}
          icon={AlertTriangle}
          description="Marked as suspicious"
          className="bg-amber-500/10"
        />
        
        <StatsCard
          title="Expired Batches"
          value={stats?.expired}
          loading={loading}
          icon={Calendar}
          description="Past expiration date"
          className="bg-red-500/10"
        />
      </div>

      {/* Quick Links */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <QuickLinkCard
            title="Register New Batch"
            description="Create a new batch entry on the blockchain"
            icon={Package}
            href="/register"
            disabled={!connected}
          />
          
          <QuickLinkCard
            title="Scan QR Code"
            description="Verify a batch using its QR code"
            icon={Scan}
            href="/scan"
            disabled={false}
          />
          
          <QuickLinkCard
            title="Transfer Ownership"
            description="Transfer a batch to a new owner"
            icon={Repeat}
            href="/transfer"
            disabled={!connected}
          />
          
          <QuickLinkCard
            title="Regulator Dashboard"
            description="Advanced tools for regulators"
            icon={BarChart3}
            href="/dashboard/regulator"
            disabled={!connected}
          />
        </div>
      </div>
      
      {/* Recent Activity */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Latest Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-1 flex-1">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-3 w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : stats?.total === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                <div className="flex justify-center mb-2">
                  <Package className="h-12 w-12 opacity-20" />
                </div>
                <p>No batches have been registered yet.</p>
                <Button asChild className="mt-4">
                  <Link href="/register">Register Your First Batch</Link>
                </Button>
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                <div className="flex justify-center mb-2">
                  <Loader2 className="h-8 w-8 opacity-20 animate-spin" />
                </div>
                <p>Loading recent activity...</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

interface StatsCardProps {
  title: string;
  value: number | undefined;
  loading: boolean;
  icon: React.ElementType;
  description: string;
  className?: string;
}

function StatsCard({ title, value, loading, icon: Icon, description, className }: StatsCardProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-24" />
        ) : (
          <div className="text-2xl font-bold">{value}</div>
        )}
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

interface QuickLinkCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
  href: string;
  disabled: boolean;
}

function QuickLinkCard({ title, description, icon: Icon, href, disabled }: QuickLinkCardProps) {
  return (
    <Card className={cn("overflow-hidden transition-all duration-300 hover:shadow-md", 
      disabled && "opacity-60 cursor-not-allowed"
    )}>
      <Link href={disabled ? "#" : href} className={cn("block h-full", disabled && "pointer-events-none")}>
        <CardContent className="p-6">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <h3 className="font-semibold mb-1">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </CardContent>
      </Link>
    </Card>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}