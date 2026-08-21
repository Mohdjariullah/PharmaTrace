"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import WalletConnect from "@/components/WalletConnect";
import { useTheme } from "next-themes";
import {
  Menu,
  Home,
  Package,
  Scan,
  Repeat,
  BarChart3,
  Sun,
  Moon,
  ShieldCheck,
  Shield,
  ArrowLeft,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useWalletContext } from "@/components/WalletProvider";

interface DashboardNavbarProps {
  children: React.ReactNode;
}

export default function DashboardNavbar({ children }: DashboardNavbarProps) {
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const { connected } = useWalletContext();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const routes = [
    { href: "/dashboard", label: "Overview", icon: Home, active: pathname === "/dashboard", requiresWallet: false },
    { href: "/register", label: "Register batch", icon: Package, active: pathname === "/register", requiresWallet: true },
    { href: "/scan", label: "Scan QR", icon: Scan, active: pathname === "/scan", requiresWallet: false },
    { href: "/verify", label: "Verify batch", icon: Shield, active: pathname.startsWith("/verify"), requiresWallet: false },
    { href: "/transfer", label: "Transfer batch", icon: Repeat, active: pathname === "/transfer", requiresWallet: true },
    { href: "/dashboard/regulator", label: "Regulator tools", icon: BarChart3, active: pathname === "/dashboard/regulator", requiresWallet: true },
  ];

  const handleNavigation = (route: (typeof routes)[0], e: React.MouseEvent) => {
    if (route.requiresWallet && !connected) {
      e.preventDefault();
      toast({
        title: "Wallet required",
        description: "Connect your wallet to access this feature.",
        variant: "destructive",
      });
    } else {
      setOpen(false);
    }
  };

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  if (!isMounted) {
    return null;
  }

  const NavLink = ({ route, withDescription }: { route: (typeof routes)[0]; withDescription?: boolean }) => {
    const Icon = route.icon;
    return (
      <Link
        href={route.href}
        onClick={(e) => handleNavigation(route, e)}
        className={cn(
          "flex items-center gap-3 rounded-md px-3.5 py-2.5 text-sm font-medium transition-colors",
          route.active
            ? "bg-secondary text-foreground"
            : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
        )}
      >
        <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
        <span className="flex-1">{route.label}</span>
        {route.requiresWallet && !connected && (
          <Badge variant="secondary" className="text-[10px] font-normal">
            Wallet
          </Badge>
        )}
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Mobile Menu Button */}
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80">
                <div className="flex flex-col h-full">
                  <div className="flex items-center gap-2.5 pb-6 border-b border-border">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
                      <ShieldCheck className="h-4 w-4 text-primary-foreground" strokeWidth={2.25} />
                    </div>
                    <div>
                      <h2 className="text-[15px] font-semibold tracking-tight">PharmaTrace</h2>
                      <p className="text-xs text-muted-foreground">Dashboard</p>
                    </div>
                  </div>

                  <nav className="flex-1 py-6 space-y-1">
                    {routes.map((route) => (
                      <NavLink key={route.href} route={route} />
                    ))}
                  </nav>

                  <div className="pt-6 border-t border-border">
                    <Link
                      href="/"
                      className="flex items-center gap-3 rounded-md px-3.5 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Back to home
                    </Link>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            {/* Logo */}
            <Link href="/dashboard" className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
                <ShieldCheck className="h-4 w-4 text-primary-foreground" strokeWidth={2.25} />
              </div>
              <div className="hidden sm:block leading-tight">
                <div className="text-[15px] font-semibold tracking-tight">PharmaTrace</div>
                <div className="text-xs text-muted-foreground">Dashboard</div>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {routes.slice(0, 4).map((route) => {
                const Icon = route.icon;
                return (
                  <Link
                    key={route.href}
                    href={route.href}
                    onClick={(e) => handleNavigation(route, e)}
                    className={cn(
                      "relative flex items-center gap-2 px-3.5 py-2 rounded-md text-sm font-medium transition-colors",
                      route.active
                        ? "bg-secondary text-foreground"
                        : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" strokeWidth={1.75} />
                    {route.label}
                    {route.requiresWallet && !connected && (
                      <span className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-destructive" />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={toggleTheme} className="relative w-9 h-9 rounded-md">
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>

              <WalletConnect />

              <Button asChild variant="outline" size="sm" className="hidden sm:flex">
                <Link href="/">
                  <ArrowLeft className="h-4 w-4 mr-1.5" />
                  Home
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar for larger screens */}
        <aside className="hidden lg:block w-64 shrink-0 border-r border-border">
          <div className="sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
            <nav className="p-4 space-y-1">
              {routes.map((route) => (
                <NavLink key={route.href} route={route} />
              ))}
            </nav>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0">
          <div className="container mx-auto px-4 py-8 sm:px-6 lg:py-10">{children}</div>
        </main>
      </div>
    </div>
  );
}
