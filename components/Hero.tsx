import { Pill } from "lucide-react";
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
    <div className={cn("relative bg-gradient-to-b from-primary/10 to-background pt-20 pb-24", className)}>
      <div className="absolute inset-0 bg-grid-pattern bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex justify-center mb-6">
          <div className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full">
            <Pill className="h-4 w-4" />
            <span className="text-sm font-medium">Blockchain-Secured Pharma Supply Chain</span>
          </div>
        </div>
        
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
            {title}
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150">
            {subtitle}
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
            <Button asChild size="lg">
              <Link href="/dashboard">Get Started</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="#features">Learn More</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}