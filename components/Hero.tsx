import React from "react";
import { Pill, ArrowRight, Shield, Zap, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface HeroProps {
  title: string;
  subtitle: string;
  className?: string;
}

export default function Hero({ title, subtitle, className }: HeroProps) {
  return (
    <div className={cn("relative min-h-screen flex items-center justify-center overflow-hidden", className)}>
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%239C92AC\" fill-opacity=\"0.1\"%3E%3Ccircle cx=\"30\" cy=\"30\" r=\"2\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-gradient-to-r from-pink-400 to-red-500 rounded-full opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute bottom-40 left-20 w-24 h-24 bg-gradient-to-r from-green-400 to-blue-500 rounded-full opacity-20 animate-pulse delay-2000"></div>
        <div className="absolute bottom-20 right-10 w-18 h-18 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full opacity-20 animate-pulse delay-500"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10 pt-20">
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-3 bg-gradient-to-r from-blue-600/10 to-purple-600/10 backdrop-blur-sm border border-blue-200/20 dark:border-blue-700/20 text-blue-700 dark:text-blue-300 px-6 py-3 rounded-full shadow-lg">
            <div className="relative">
              <Pill className="h-5 w-5" />
              <div className="absolute inset-0 bg-blue-400 rounded-full blur opacity-50 animate-ping"></div>
            </div>
            <span className="text-sm font-medium">Blockchain-Secured Pharma Supply Chain</span>
            <Zap className="h-4 w-4 text-yellow-500" />
          </div>
        </div>
        
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              {title}
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-12 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150">
            {subtitle}
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-6 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
            <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200">
              <Link href="/dashboard" className="flex items-center gap-2">
                Get Started
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-2 border-purple-200 dark:border-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
              <Link href="/scan" className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Verify Product
              </Link>
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-12 duration-700 delay-500">
            <div className="flex items-center justify-center gap-3 text-gray-600 dark:text-gray-400">
              <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-gray-900 dark:text-white">Blockchain Secured</div>
                <div className="text-sm">Immutable verification</div>
              </div>
            </div>
            
            <div className="flex items-center justify-center gap-3 text-gray-600 dark:text-gray-400">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-gray-900 dark:text-white">Real-time Tracking</div>
                <div className="text-sm">Instant verification</div>
              </div>
            </div>
            
            <div className="flex items-center justify-center gap-3 text-gray-600 dark:text-gray-400">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-red-500 rounded-full flex items-center justify-center">
                <Globe className="h-6 w-6 text-white" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-gray-900 dark:text-white">Global Network</div>
                <div className="text-sm">Worldwide coverage</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
  );
}