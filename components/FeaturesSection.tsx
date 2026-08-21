"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Package,
  Scan,
  Repeat,
  BarChart3,
  ShieldAlert,
  Globe,
  Layers,
  Timer,
  GitBranch,
  KeyRound,
} from "lucide-react";

const features = [
  {
    icon: Package,
    title: "Batch registration",
    description: "Register pharmaceutical batches with immutable on-chain records and full metadata tracking.",
  },
  {
    icon: Scan,
    title: "QR verification",
    description: "Instantly confirm product authenticity by scanning a QR code against on-chain state.",
  },
  {
    icon: Repeat,
    title: "Ownership transfer",
    description: "Move custody through the supply chain with cryptographically signed transfers.",
  },
  {
    icon: BarChart3,
    title: "Live dashboards",
    description: "Monitor batch status, transfers, and flags in real time as a manufacturer or regulator.",
  },
  {
    icon: ShieldAlert,
    title: "Regulatory flagging",
    description: "Regulators can flag suspect batches directly on-chain, visible to every party instantly.",
  },
  {
    icon: Globe,
    title: "Public verifiability",
    description: "Anyone can independently confirm a batch's record without trusting a central party.",
  },
];

const protocolSpecs = [
  { icon: Layers, label: "Network", value: "Solana" },
  { icon: Timer, label: "Confirmation", value: "~400ms" },
  { icon: GitBranch, label: "Program", value: "Anchor / Rust" },
  { icon: KeyRound, label: "Integrity", value: "Ed25519-signed" },
];

export default function FeaturesSection() {
  return (
    <section className="py-24">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center">
          <span className="font-mono text-xs font-medium uppercase tracking-wider text-primary">
            Platform
          </span>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Everything needed for verifiable pharmaceutical tracking
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            One system covering the full chain of custody — from manufacturer registration to
            point-of-sale verification.
          </p>
        </div>

        {/* Protocol specs strip - honest technical facts, not vanity stats */}
        <div className="mx-auto mt-14 grid max-w-4xl grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-4">
          {protocolSpecs.map((spec) => {
            const Icon = spec.icon;
            return (
              <div key={spec.label} className="flex flex-col gap-1.5 bg-card px-5 py-5">
                <Icon className="h-4 w-4 text-primary" strokeWidth={1.75} />
                <div className="font-mono text-lg font-semibold text-foreground">{spec.value}</div>
                <div className="text-xs text-muted-foreground">{spec.label}</div>
              </div>
            );
          })}
        </div>

        {/* Features Grid */}
        <div className="mt-16 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <Card
                key={feature.title}
                className="border-border shadow-none transition-colors hover:border-primary/40"
              >
                <CardHeader>
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-md border border-border bg-secondary/60">
                    <Icon className="h-5 w-5 text-primary" strokeWidth={1.75} />
                  </div>
                  <CardTitle className="text-base font-semibold text-foreground">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
