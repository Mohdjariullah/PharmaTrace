"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Package,
  Scan,
  Repeat,
  BarChart3,
  AlertTriangle,
  Calendar,
  Shield,
} from "lucide-react";
import Link from "next/link";
import { getBatchStats } from "@/services/supabaseService";
import { useWalletContext } from "@/components/WalletProvider";
import { truncatePublicKey } from "@/lib/solana";
import MyBatches from "@/components/MyBatches";

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
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Overview</h1>
          <p className="mt-1 text-muted-foreground">
            {connected
              ? `Connected as ${truncatePublicKey(publicKey || "")}`
              : "Connect your wallet to register or transfer batches."}
          </p>
        </div>
        <Badge variant="outline" className="w-fit gap-1.5 font-mono text-xs">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          Solana Devnet
        </Badge>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Total batches" value={stats?.total} loading={loading} icon={Package} description="Registered in system" />
        <StatsCard title="Pending transfer" value={stats?.pendingTransfer} loading={loading} icon={Repeat} description="Awaiting transfer" />
        <StatsCard title="Flagged batches" value={stats?.flagged} loading={loading} icon={AlertTriangle} description="Marked suspicious" />
        <StatsCard title="Expired batches" value={stats?.expired} loading={loading} icon={Calendar} description="Past expiration" />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="mb-4 text-sm font-semibold text-foreground">Quick actions</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <QuickActionCard
            title="Register new batch"
            description="Create a new batch entry on-chain"
            icon={Package}
            href="/register"
            disabled={!connected}
          />
          <QuickActionCard
            title="Scan QR code"
            description="Verify a batch using its QR code"
            icon={Scan}
            href="/scan"
            disabled={false}
          />
          <QuickActionCard
            title="Transfer ownership"
            description="Transfer a batch to a new owner"
            icon={Repeat}
            href="/transfer"
            disabled={!connected}
          />
          <QuickActionCard
            title="Verify batch"
            description="Verify batch authenticity"
            icon={Shield}
            href="/verify"
            disabled={false}
          />
          <QuickActionCard
            title="Regulator tools"
            description="Flag batches and monitor compliance"
            icon={BarChart3}
            href="/dashboard/regulator"
            disabled={!connected}
          />
        </div>
      </div>

      {/* Network Information - real, static protocol facts, not fabricated metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Network</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <div>
            <div className="text-xs text-muted-foreground">Cluster</div>
            <div className="mt-1 font-mono text-sm">devnet</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">RPC endpoint</div>
            <div className="mt-1 font-mono text-sm">api.devnet.solana.com</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Program</div>
            <div className="mt-1 font-mono text-sm">Anchor / Rust</div>
          </div>
        </CardContent>
      </Card>

      {/* Your batches - real data fetched for the connected wallet, not a fabricated feed */}
      {connected && (
        <div>
          <h2 className="mb-4 text-sm font-semibold text-foreground">Your batches</h2>
          <MyBatches />
        </div>
      )}
    </div>
  );
}

interface StatsCardProps {
  title: string;
  value: number | undefined;
  loading: boolean;
  icon: React.ElementType;
  description: string;
}

function StatsCard({ title, value, loading, icon: Icon, description }: StatsCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
          <div className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-secondary/60">
            <Icon className="h-4 w-4 text-primary" strokeWidth={1.75} />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="mb-1 h-8 w-16" />
        ) : (
          <div className="text-2xl font-semibold text-foreground">{value ?? 0}</div>
        )}
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
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
}

function QuickActionCard({ title, description, icon: Icon, href, disabled }: QuickActionCardProps) {
  return (
    <Card className={disabled ? "opacity-60" : "transition-colors hover:border-primary/40"}>
      <Link href={disabled ? "#" : href} className={`block h-full ${disabled ? "pointer-events-none" : ""}`}>
        <CardContent className="p-5">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-md border border-border bg-secondary/60">
            <Icon className="h-5 w-5 text-primary" strokeWidth={1.75} />
          </div>
          <h3 className="font-semibold text-foreground">{title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          {disabled && (
            <Badge variant="secondary" className="mt-3 text-xs">
              Wallet required
            </Badge>
          )}
        </CardContent>
      </Link>
    </Card>
  );
}
