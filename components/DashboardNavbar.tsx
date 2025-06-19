"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
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
  ChevronRight,
  Sun,
  Moon,
  Pill,
  Shield,
  Zap,
  ArrowLeft
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useWalletContext } from "@/components/WalletProvider";

interface DashboardNavbarProps {
  children: React.ReactNode;
}

export default function DashboardNavbar({ children }: DashboardNavbarProps) {
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [open, setOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const { connected } = useWalletContext();

  // Update isMobile based on window width
  useEffect(() => {
    setIsMounted(true);
    
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const routes = [
    {
      href: "/dashboard",
      label: "Overview",
      icon: Home,
      active: pathname === "/dashboard",
      requiresWallet: false,
      description: "Dashboard overview and statistics"
    },
    {
      href: "/register",
      label: "Register Batch",
      icon: Package,
      active: pathname === "/register",
      requiresWallet: true,
      description: "Register new pharmaceutical batches"
    },
    {
      href: "/scan",
      label: "Scan QR",
      icon: Scan,
      active: pathname === "/scan",
      requiresWallet: false,
      description: "Scan QR codes for verification"
    },
    {
      href: "/verify",
      label: "Verify Batch",
      icon: Shield,
      active: pathname.startsWith("/verify"),
      requiresWallet: false,
      description: "Verify batch authenticity"
    },
    {
      href: "/transfer",
      label: "Transfer Batch",
      icon: Repeat,
      active: pathname === "/transfer",
      requiresWallet: true,
      description: "Transfer batch ownership"
    },
    {
      href: "/dashboard/regulator",
      label: "Regulator Tools",
      icon: BarChart3,
      active: pathname === "/dashboard/regulator",
      requiresWallet: true,
      description: "Advanced regulatory tools"
    },
  ];

  // Handle navigation for items requiring wallet
  const handleNavigation = (route: typeof routes[0], e: React.MouseEvent) => {
    if (route.requiresWallet && !connected) {
      e.preventDefault();
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to access this feature.",
        variant: "destructive",
      });
    } else if (isMobile) {
      setOpen(false);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  if (!isMounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-gray-800">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/20 dark:border-gray-700/20 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Mobile Menu Button */}
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 bg-white dark:bg-gray-900">
                <div className="flex flex-col h-full">
                  {/* Mobile Header */}
                  <div className="flex items-center gap-3 pb-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                      <Pill className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        PharmaTrace
                      </h2>
                      <p className="text-xs text-muted-foreground">Dashboard</p>
                    </div>
                  </div>

                  {/* Mobile Navigation */}
                  <nav className="flex-1 py-6">
                    <div className="space-y-2">
                      {routes.map((route) => (
                        <Link
                          key={route.href}
                          href={route.href}
                          onClick={(e) => handleNavigation(route, e)}
                          className={cn(
                            "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 group",
                            route.active 
                              ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg" 
                              : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                          )}
                        >
                          <route.icon className="h-5 w-5" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              {route.label}
                              {route.requiresWallet && !connected && (
                                <Badge variant="secondary" className="text-xs">Wallet Required</Badge>
                              )}
                            </div>
                            <div className="text-xs opacity-70 mt-0.5">{route.description}</div>
                          </div>
                          <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                      ))}
                    </div>
                  </nav>

                  {/* Mobile Footer */}
                  <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                    <Link
                      href="/"
                      className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Back to Home
                    </Link>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            
            {/* Logo */}
            <Link href="/dashboard" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <Pill className="h-6 w-6 text-white" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity duration-200"></div>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  PharmaTrace
                </h1>
                <p className="text-xs text-muted-foreground">Dashboard</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {routes.slice(0, 4).map((route) => {
                const Icon = route.icon;
                const isActive = route.active;
                
                return (
                  <Link
                    key={route.href}
                    href={route.href}
                    onClick={(e) => handleNavigation(route, e)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-105 relative group",
                      isActive
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                        : "text-gray-600 dark:text-gray-300 hover:bg-white/60 dark:hover:bg-gray-800/60"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden lg:inline">{route.label}</span>
                    {route.requiresWallet && !connected && (
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-3">
              {/* Theme Toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="relative w-10 h-10 rounded-xl hover:bg-white/60 dark:hover:bg-gray-800/60 transition-colors duration-200"
              >
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>

              {/* Wallet Connect */}
              <WalletConnect />

              {/* Back to Home */}
              <Button asChild variant="outline" size="sm" className="hidden sm:flex">
                <Link href="/">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Home
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar for larger screens */}
      <div className="flex flex-1">
        <aside className="hidden lg:block w-72 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border-r border-gray-200/20 dark:border-gray-700/20">
          <div className="sticky top-20 h-[calc(100vh-5rem)] overflow-y-auto">
            <div className="p-6">
              {/* Quick Stats */}
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Quick Stats</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-3">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-blue-600" />
                      <span className="text-xs font-medium text-blue-700 dark:text-blue-300">Active</span>
                    </div>
                    <div className="text-lg font-bold text-blue-900 dark:text-blue-100 mt-1">24</div>
                  </div>
                  <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-3">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-green-600" />
                      <span className="text-xs font-medium text-green-700 dark:text-green-300">Verified</span>
                    </div>
                    <div className="text-lg font-bold text-green-900 dark:text-green-100 mt-1">156</div>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <nav className="space-y-2">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Navigation</h3>
                {routes.map((route) => (
                  <Link
                    key={route.href}
                    href={route.href}
                    onClick={(e) => handleNavigation(route, e)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 group",
                      route.active 
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg" 
                        : "text-gray-600 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-gray-800/80"
                    )}
                  >
                    <route.icon className="h-5 w-5" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {route.label}
                        {route.requiresWallet && !connected && (
                          <Badge variant="secondary" className="text-xs">Wallet Required</Badge>
                        )}
                      </div>
                      <div className="text-xs opacity-70 mt-0.5">{route.description}</div>
                    </div>
                    <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        </aside>
        
        {/* Main content */}
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}