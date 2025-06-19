import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import FeaturesSection from '@/components/FeaturesSection';
import HowItWorksSection from '@/components/HowItWorksSection';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <Hero 
        title="Immutable Pharmaceutical Supply Chain on Solana"
        subtitle="Prevent counterfeit drugs and ensure regulatory compliance with blockchain-verified traceability from manufacturer to patient."
      />
      
      <FeaturesSection />
      
      <HowItWorksSection />
      
      <Footer />
    </div>
  );
}