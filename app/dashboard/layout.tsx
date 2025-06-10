"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import WalletConnect from "@/components/WalletConnect";
import { 
  Menu, 
  Home, 
  Package, 
  Scan, 
  Repeat, 
  BarChart3, 
  ChevronRight,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useWalletContext } from "@/components/WalletProvider";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [open, setOpen] = useState(false);
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
    },
    {
      href: "/register",
      label: "Register Batch",
      icon: Package,
      active: pathname === "/register",
      requiresWallet: true,
    },
    {
      href: "/scan",
      label: "Scan QR",
      icon: Scan,
      active: pathname === "/scan",
      requiresWallet: false,
    },
    {
      href: "/transfer",
      label: "Transfer Batch",
      icon: Repeat,
      active: pathname === "/transfer",
      requiresWallet: true,
    },
    {
      href: "/dashboard/regulator",
      label: "Regulator",
      icon: BarChart3,
      active: pathname === "/dashboard/regulator",
      requiresWallet: true,
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

  if (!isMounted) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="flex flex-col">
            <nav className="grid gap-2 text-lg font-medium">
              {routes.map((route) => (
                <Link
                  key={route.href}
                  href={route.href}
                  onClick={(e) => handleNavigation(route, e)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-accent transition-colors",
                    route.active ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                  )}
                >
                  <route.icon className="h-5 w-5" />
                  {route.label}
                  <ChevronRight className="ml-auto h-4 w-4" />
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
        
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Package className="h-6 w-6" />
          <span className="hidden md:inline">PharmaTrace</span>
        </Link>
        
        <div className="ml-auto flex items-center gap-2">
          <WalletConnect />
        </div>
      </header>
      
      <div className="flex flex-1">
        {/* Sidebar (desktop only) */}
        <div className="hidden border-r bg-muted/40 md:block md:w-64 lg:w-72">
          <div className="flex h-full max-h-screen flex-col gap-2">
            <div className="flex-1 overflow-auto py-4">
              <nav className="grid gap-1 px-2">
                {routes.map((route) => (
                  <Link
                    key={route.href}
                    href={route.href}
                    onClick={(e) => handleNavigation(route, e)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                      route.active 
                        ? "bg-primary text-primary-foreground" 
                        : "hover:bg-muted text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <route.icon className="h-4 w-4" />
                    {route.label}
                  </Link>
                ))}
              </nav>
            </div>
            
            <div className="p-4">
              <Separator className="mb-4" />
              <div className="grid gap-1">
                <Link
                  href="/"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors hover:bg-muted"
                >
                  Home
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        {/* Main content */}
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto p-4 md:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}