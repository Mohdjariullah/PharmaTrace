"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import {
  Menu,
  ShieldCheck,
  Sun,
  Moon,
  Package,
  Scan,
  BarChart3,
  Shield,
} from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: BarChart3 },
    { name: "Register", href: "/register", icon: Package },
    { name: "Scan", href: "/scan", icon: Scan },
    { name: "Verify", href: "/verify", icon: Shield },
  ];

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  if (!mounted) {
    return null;
  }

  return (
    <nav className="fixed top-0 w-full z-50 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
              <ShieldCheck className="h-4 w-4 text-primary-foreground" strokeWidth={2.25} />
            </div>
            <span className="text-[15px] font-semibold tracking-tight">
              PharmaTrace
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 px-3.5 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                  )}
                >
                  <Icon className="h-4 w-4" strokeWidth={2} />
                  {item.name}
                </Link>
              );
            })}
          </div>

          {/* Theme Toggle & Mobile Menu */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="relative w-9 h-9 rounded-md"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>

            <Button asChild size="sm" className="hidden sm:inline-flex ml-1">
              <Link href="/dashboard">Open dashboard</Link>
            </Button>

            {/* Mobile Menu */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden w-9 h-9 rounded-md"
                >
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between pb-6 border-b border-border">
                    <Link href="/" className="flex items-center gap-2.5" onClick={() => setIsOpen(false)}>
                      <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
                        <ShieldCheck className="h-4 w-4 text-primary-foreground" strokeWidth={2.25} />
                      </div>
                      <span className="text-[15px] font-semibold tracking-tight">
                        PharmaTrace
                      </span>
                    </Link>
                  </div>

                  <div className="flex-1 py-6">
                    <div className="space-y-1">
                      {navigation.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;

                        return (
                          <Link
                            key={item.name}
                            href={item.href}
                            onClick={() => setIsOpen(false)}
                            className={cn(
                              "flex items-center gap-3 px-3.5 py-2.5 rounded-md text-[15px] font-medium transition-colors",
                              isActive
                                ? "bg-secondary text-foreground"
                                : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                            )}
                          >
                            <Icon className="h-4 w-4" strokeWidth={2} />
                            {item.name}
                          </Link>
                        );
                      })}
                    </div>
                  </div>

                  <div className="pt-6 border-t border-border">
                    <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                      Secure · Transparent · Verified
                    </p>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
