"use client";

import Link from "next/link";
import { ShieldCheck, Github, Mail } from "lucide-react";

const footerLinks = {
  product: [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Register batch", href: "/register" },
    { name: "Scan QR", href: "/scan" },
    { name: "Verify", href: "/verify" },
    { name: "Transfer batch", href: "/transfer" },
  ],
  company: [
    { name: "About", href: "/about" },
    { name: "Documentation", href: "/docs" },
    { name: "Support", href: "/support" },
    { name: "API reference", href: "/api-docs" },
  ],
  legal: [
    { name: "Privacy policy", href: "/privacy" },
    { name: "Terms of service", href: "/terms" },
    { name: "Cookie policy", href: "/cookies" },
    { name: "Compliance", href: "/compliance" },
  ],
};

export default function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="container mx-auto px-4 py-16 sm:px-6">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
                <ShieldCheck className="h-4 w-4 text-primary-foreground" strokeWidth={2.25} />
              </div>
              <span className="text-base font-semibold tracking-tight text-foreground">
                PharmaTrace
              </span>
            </Link>

            <p className="mt-4 max-w-sm leading-relaxed text-muted-foreground">
              Verifiable pharmaceutical supply chain tracking, secured on Solana — from
              manufacturer registration to point-of-sale scan.
            </p>

            <div className="mt-6 flex gap-2">
              <a
                href="https://github.com/Mohdjariullah/PharmaTrace"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                aria-label="GitHub"
              >
                <Github className="h-4 w-4" />
              </a>
              <a
                href="mailto:contact@pharmatrace.com"
                className="flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                aria-label="Email"
              >
                <Mail className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="text-sm font-semibold text-foreground">Product</h4>
            <ul className="mt-4 space-y-2.5">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="text-sm font-semibold text-foreground">Company</h4>
            <ul className="mt-4 space-y-2.5">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="text-sm font-semibold text-foreground">Legal</h4>
            <ul className="mt-4 space-y-2.5">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border">
        <div className="container mx-auto flex flex-col items-center justify-between gap-3 px-4 py-6 text-sm text-muted-foreground sm:flex-row sm:px-6">
          <span>© 2026 PharmaTrace. All rights reserved.</span>
          <span className="flex items-center gap-2 font-mono text-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Solana Devnet
          </span>
        </div>
      </div>
    </footer>
  );
}
