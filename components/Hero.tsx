"use client";

import React from "react";
import { ArrowRight, ShieldCheck, Fingerprint, Radar } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface HeroProps {
  title: string;
  subtitle: string;
  className?: string;
}

const trustPoints = [
  {
    icon: Fingerprint,
    label: "Immutable records",
    detail: "Every batch anchored on-chain",
  },
  {
    icon: Radar,
    label: "Real-time verification",
    detail: "Scan to confirm in seconds",
  },
  {
    icon: ShieldCheck,
    label: "Chain-of-custody",
    detail: "Full manufacturer-to-patient trail",
  },
];

export default function Hero({ title, subtitle, className }: HeroProps) {
  return (
    <div className={cn("relative overflow-hidden pt-32 pb-24 sm:pt-40 sm:pb-32", className)}>
      {/* Restrained background: a faint dot grid + one soft glow, not a color-soup */}
      <div
        className="absolute inset-0 -z-10 opacity-[0.4] dark:opacity-[0.25]"
        style={{
          backgroundImage: "radial-gradient(hsl(var(--border)) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          maskImage: "radial-gradient(ellipse 70% 60% at 50% 0%, black 40%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 70% 60% at 50% 0%, black 40%, transparent 100%)",
        }}
      />
      <div className="absolute left-1/2 top-0 -z-10 h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />

      <div className="container mx-auto px-4 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 shadow-sm">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
            </span>
            <span className="font-mono text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Blockchain-secured pharma supply chain
            </span>
          </div>

          <h1 className="text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-6xl">
            {title}
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-balance text-lg leading-relaxed text-muted-foreground sm:text-xl">
            {subtitle}
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="gap-2">
              <Link href="/dashboard">
                Get started
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/scan" className="gap-2">
                <ShieldCheck className="h-4 w-4" />
                Verify a product
              </Link>
            </Button>
          </div>
        </div>

        {/* Trust indicators - plain, no gradient icon soup */}
        <div className="mx-auto mt-20 grid max-w-4xl grid-cols-1 gap-8 border-t border-border pt-10 sm:grid-cols-3">
          {trustPoints.map((point) => {
            const Icon = point.icon;
            return (
              <div key={point.label} className="flex items-start gap-3">
                <Icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" strokeWidth={1.75} />
                <div>
                  <div className="text-sm font-semibold text-foreground">{point.label}</div>
                  <div className="text-sm text-muted-foreground">{point.detail}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
