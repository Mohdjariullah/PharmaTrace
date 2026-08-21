"use client";

import { Button } from "@/components/ui/button";
import { Package, Scan, Repeat, BarChart3, ArrowRight } from "lucide-react";
import Link from "next/link";

const steps = [
  {
    number: "01",
    icon: Package,
    title: "Register the batch",
    description:
      "The manufacturer registers a batch on-chain with product details, manufacturing and expiry dates, and a unique identifier.",
    tags: ["Immutable record", "QR generation"],
  },
  {
    number: "02",
    icon: Scan,
    title: "Scan to verify",
    description:
      "Anyone downstream — pharmacy, distributor, or patient — scans the QR code to confirm authenticity directly against the chain.",
    tags: ["Instant lookup", "Full history"],
  },
  {
    number: "03",
    icon: Repeat,
    title: "Transfer custody",
    description:
      "Ownership moves through the supply chain via cryptographically signed, on-chain transfers — no shared spreadsheet, no trust required.",
    tags: ["Signed transfers", "Audit trail"],
  },
  {
    number: "04",
    icon: BarChart3,
    title: "Monitor & flag",
    description:
      "Regulators track batch status in real time and can flag a batch directly on-chain the moment a problem is found.",
    tags: ["Live dashboard", "Regulatory flags"],
  },
];

export default function HowItWorksSection() {
  return (
    <section className="border-t border-border py-24">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="font-mono text-xs font-medium uppercase tracking-wider text-primary">
            Process
          </span>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            A transparent process, start to finish
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            Four steps take a batch from the factory floor to a verified scan in a patient&apos;s hands.
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-3xl">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isLast = index === steps.length - 1;

            return (
              <div key={step.number} className="relative flex gap-6 pb-12 last:pb-0">
                {!isLast && (
                  <div className="absolute left-[19px] top-11 h-[calc(100%-2rem)] w-px bg-border" />
                )}

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-card">
                  <Icon className="h-5 w-5 text-primary" strokeWidth={1.75} />
                </div>

                <div className="flex-1 pt-1">
                  <div className="flex items-baseline gap-3">
                    <span className="font-mono text-xs text-muted-foreground">{step.number}</span>
                    <h3 className="text-lg font-semibold text-foreground">{step.title}</h3>
                  </div>
                  <p className="mt-2 leading-relaxed text-muted-foreground">{step.description}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {step.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-border bg-secondary/50 px-2.5 py-1 font-mono text-[11px] text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Call to Action */}
        <div className="mx-auto mt-16 max-w-3xl rounded-xl border border-border bg-card p-10 text-center">
          <h3 className="text-2xl font-semibold text-foreground">
            Ready to trace your first batch?
          </h3>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            Connect a Solana wallet and register a batch in minutes — no setup beyond that.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="gap-2">
              <Link href="/register">
                Register a batch
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="gap-2">
              <Link href="/scan">
                <Scan className="h-4 w-4" />
                Try scanning
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
