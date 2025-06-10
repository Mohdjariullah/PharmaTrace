import Link from 'next/link';
import { Button } from '@/components/ui/button';
import FeatureCard from '@/components/FeatureCard';
import Hero from '@/components/Hero';
import { ArrowRight, Scan, Package, BarChart3, Repeat } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Hero 
        title="Immutable Pharmaceutical Supply Chain on Solana"
        subtitle="Prevent counterfeit drugs and ensure regulatory compliance with blockchain-verified traceability from manufacturer to patient."
      />
      
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight mb-4">How PharmaTrace Works</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Our hybrid architecture combines the immutability of Solana blockchain with the performance of Supabase, 
            providing a complete solution for pharmaceutical supply chain integrity.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <FeatureCard 
            icon={Package}
            title="Register Batches"
            description="Securely register pharmaceutical batches with product details, expiry dates, and unique blockchain identifiers."
          />
          
          <FeatureCard 
            icon={Scan}
            title="Scan & Verify"
            description="Instantly verify authenticity by scanning QR codes to view the complete blockchain-secured history."
          />
          
          <FeatureCard 
            icon={Repeat}
            title="Transfer Ownership"
            description="Securely transfer batch ownership throughout the supply chain with cryptographic verification."
          />
          
          <FeatureCard 
            icon={BarChart3}
            title="Regulator Dashboard"
            description="Real-time analytics and tools for regulators to monitor and flag suspicious activities."
          />
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
          <Button asChild size="lg" className="gap-2">
            <Link href="/dashboard">
              Launch App <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          
          <Button asChild size="lg" variant="outline" className="gap-2">
            <Link href="/scan">
              Scan QR Code <Scan className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}