"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Package, 
  Scan, 
  Repeat, 
  BarChart3, 
  AlertTriangle, 
  Calendar,
  TrendingUp,
  Shield,
  Zap,
  Users,
  Activity,
  CheckCircle,
  Clock
} from "lucide-react";
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
  const { connected, publicKey } = useWalletContext();

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
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Welcome to PharmaTrace</h1>
              <p className="text-blue-100 text-lg">
                {connected ? `Connected as ${publicKey?.slice(0, 8)}...` : 'Connect your wallet to get started'}
              </p>
            </div>
            <div className="hidden md:flex items-center gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{stats?.total || 0}</div>
                <div className="text-blue-100 text-sm">Total Batches</div>
              </div>
              <div className="w-px h-12 bg-white/20"></div>
              <div className="text-center">
                <div className="text-2xl font-bold">99.9%</div>
                <div className="text-blue-100 text-sm">Uptime</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute top-4 right-4 w-20 h-20 bg-white/10 rounded-full animate-pulse"></div>
        <div className="absolute bottom-4 left-4 w-16 h-16 bg-white/5 rounded-full animate-pulse delay-1000"></div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Batches"
          value={stats?.total}
          loading={loading}
          icon={Package}
          description="Registered in system"
          trend="+12%"
          color="from-blue-500 to-cyan-500"
        />
        
        <StatsCard
          title="Pending Transfer"
          value={stats?.pendingTransfer}
          loading={loading}
          icon={Repeat}
          description="Awaiting transfer"
          trend="+5%"
          color="from-purple-500 to-pink-500"
        />
        
        <StatsCard
          title="Flagged Batches"
          value={stats?.flagged}
          loading={loading}
          icon={AlertTriangle}
          description="Marked suspicious"
          trend="-8%"
          color="from-amber-500 to-orange-500"
        />
        
        <StatsCard
          title="Expired Batches"
          value={stats?.expired}
          loading={loading}
          icon={Calendar}
          description="Past expiration"
          trend="+2%"
          color="from-red-500 to-pink-500"
        />
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:grid-cols-3">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="actions" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Quick Actions
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Recent Activity
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* System Status */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-200">
                  <Shield className="h-5 w-5" />
                  System Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Blockchain Network</span>
                  <Badge className="bg-green-100 text-green-700 border-green-200">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Online
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Database</span>
                  <Badge className="bg-green-100 text-green-700 border-green-200">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Connected
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">API Services</span>
                  <Badge className="bg-green-100 text-green-700 border-green-200">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Operational
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Network Info */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-600" />
                  Network Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Network</span>
                  <Badge variant="outline">Devnet</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Block Height</span>
                  <span className="text-sm font-mono">245,678,901</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">TPS</span>
                  <span className="text-sm font-mono">2,847</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="actions" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <QuickActionCard
              title="Register New Batch"
              description="Create a new batch entry on the blockchain"
              icon={Package}
              href="/register"
              disabled={!connected}
              color="from-blue-500 to-cyan-500"
            />
            
            <QuickActionCard
              title="Scan QR Code"
              description="Verify a batch using its QR code"
              icon={Scan}
              href="/scan"
              disabled={false}
              color="from-purple-500 to-pink-500"
            />
            
            <QuickActionCard
              title="Transfer Ownership"
              description="Transfer a batch to a new owner"
              icon={Repeat}
              href="/transfer"
              disabled={!connected}
              color="from-green-500 to-emerald-500"
            />
            
            <QuickActionCard
              title="Verify Batch"
              description="Verify batch authenticity"
              icon={Shield}
              href="/verify"
              disabled={false}
              color="from-orange-500 to-red-500"
            />
            
            <QuickActionCard
              title="Regulator Tools"
              description="Advanced tools for regulators"
              icon={BarChart3}
              href="/dashboard/regulator"
              disabled={!connected}
              color="from-indigo-500 to-purple-500"
            />
            
            <QuickActionCard
              title="Analytics"
              description="View detailed analytics"
              icon={TrendingUp}
              href="/dashboard/analytics"
              disabled={!connected}
              color="from-teal-500 to-blue-500"
            />
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-600" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-3 w-2/3" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : stats?.total === 0 ? (
                <div className="py-12 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-2xl flex items-center justify-center">
                    <Package className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No activity yet</h3>
                  <p className="text-muted-foreground mb-6">Start by registering your first batch</p>
                  <Button asChild>
                    <Link href="/register">Register Your First Batch</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                      <Package className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">New batch registered</div>
                      <div className="text-sm text-muted-foreground">BATCH-001 • 2 hours ago</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">Batch verified successfully</div>
                      <div className="text-sm text-muted-foreground">BATCH-002 • 4 hours ago</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                    <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                      <Repeat className="h-5 w-5 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">Ownership transferred</div>
                      <div className="text-sm text-muted-foreground">BATCH-003 • 6 hours ago</div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface StatsCardProps {
  title: string;
  value: number | undefined;
  loading: boolean;
  icon: React.ElementType;
  description: string;
  trend: string;
  color: string;
}

function StatsCard({ title, value, loading, icon: Icon, description, trend, color }: StatsCardProps) {
  return (
    <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group overflow-hidden relative">
      <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
      
      <CardHeader className="pb-2 relative">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${color} flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="relative">
        {loading ? (
          <Skeleton className="h-8 w-24 mb-2" />
        ) : (
          <div className="text-3xl font-bold mb-2">{value}</div>
        )}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{description}</p>
          <Badge variant="outline" className="text-xs">
            {trend}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}

interface QuickActionCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
  href: string;
  disabled: boolean;
  color: string;
}

function QuickActionCard({ title, description, icon: Icon, href, disabled, color }: QuickActionCardProps) {
  return (
    <Card className={`border-0 shadow-lg hover:shadow-xl transition-all duration-300 group overflow-hidden relative ${
      disabled ? 'opacity-60 cursor-not-allowed' : 'hover:-translate-y-1'
    }`}>
      <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
      
      <Link href={disabled ? "#" : href} className={`block h-full ${disabled ? 'pointer-events-none' : ''}`}>
        <CardContent className="p-6 relative">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          <h3 className="font-semibold mb-2">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
          {disabled && (
            <Badge variant="secondary" className="mt-3 text-xs">
              Wallet Required
            </Badge>
          )}
        </CardContent>
      </Link>
    </Card>
  );
}