import Link from 'next/link';
import { Button } from '@/components/ui/button';
import FeatureCard from '@/components/FeatureCard';
import Hero from '@/components/Hero';
import Navigation from '@/components/Navigation';
import { 
  ArrowRight, 
  Scan, 
  Package, 
  BarChart3, 
  Repeat, 
  Shield, 
  Zap, 
  Globe,
  Users,
  CheckCircle,
  Star,
  TrendingUp,
  Award,
  Lock
} from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <Hero 
        title="Immutable Pharmaceutical Supply Chain on Solana"
        subtitle="Prevent counterfeit drugs and ensure regulatory compliance with blockchain-verified traceability from manufacturer to patient."
      />
      
      {/* Features Section */}
      <section id="features" className="py-24 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600/10 to-pink-600/10 backdrop-blur-sm border border-purple-200/20 dark:border-purple-700/20 text-purple-700 dark:text-purple-300 px-4 py-2 rounded-full mb-6">
              <Zap className="h-4 w-4" />
              <span className="text-sm font-medium">Powerful Features</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                How PharmaTrace Works
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Our hybrid architecture combines the immutability of Solana blockchain with the performance of Supabase, 
              providing a complete solution for pharmaceutical supply chain integrity.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard 
              icon={Package}
              title="Register Batches"
              description="Securely register pharmaceutical batches with product details, expiry dates, and unique blockchain identifiers."
              gradient="from-blue-500 to-cyan-500"
            />
            
            <FeatureCard 
              icon={Scan}
              title="Scan & Verify"
              description="Instantly verify authenticity by scanning QR codes to view the complete blockchain-secured history."
              gradient="from-green-500 to-emerald-500"
            />
            
            <FeatureCard 
              icon={Repeat}
              title="Transfer Ownership"
              description="Securely transfer batch ownership throughout the supply chain with cryptographic verification."
              gradient="from-purple-500 to-violet-500"
            />
            
            <FeatureCard 
              icon={BarChart3}
              title="Regulator Dashboard"
              description="Real-time analytics and tools for regulators to monitor and flag suspicious activities."
              gradient="from-orange-500 to-red-500"
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center text-white">
            <div className="space-y-2">
              <div className="text-4xl md:text-5xl font-bold">99.9%</div>
              <div className="text-blue-100">Verification Accuracy</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl md:text-5xl font-bold">10K+</div>
              <div className="text-blue-100">Batches Tracked</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl md:text-5xl font-bold">50+</div>
              <div className="text-blue-100">Partner Companies</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl md:text-5xl font-bold">24/7</div>
              <div className="text-blue-100">Real-time Monitoring</div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
              <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                Why Choose PharmaTrace?
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Built for the future of pharmaceutical supply chain management
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="group p-8 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-700 hover:shadow-xl transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Tamper-Proof Security</h3>
              <p className="text-gray-600 dark:text-gray-300">Blockchain technology ensures that once data is recorded, it cannot be altered or deleted, providing ultimate security.</p>
            </div>

            <div className="group p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200 dark:border-blue-700 hover:shadow-xl transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Lightning Fast</h3>
              <p className="text-gray-600 dark:text-gray-300">Powered by Solana's high-performance blockchain for instant verification and minimal transaction costs.</p>
            </div>

            <div className="group p-8 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-700 hover:shadow-xl transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Globe className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Global Compliance</h3>
              <p className="text-gray-600 dark:text-gray-300">Meet international regulatory requirements with comprehensive audit trails and compliance reporting.</p>
            </div>

            <div className="group p-8 rounded-2xl bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border border-orange-200 dark:border-orange-700 hover:shadow-xl transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Users className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Multi-Stakeholder</h3>
              <p className="text-gray-600 dark:text-gray-300">Connect manufacturers, distributors, pharmacies, and regulators in one unified platform.</p>
            </div>

            <div className="group p-8 rounded-2xl bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-700 hover:shadow-xl transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Real-time Analytics</h3>
              <p className="text-gray-600 dark:text-gray-300">Get instant insights into your supply chain with comprehensive dashboards and reporting tools.</p>
            </div>

            <div className="group p-8 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-200 dark:border-indigo-700 hover:shadow-xl transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Award className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Industry Leading</h3>
              <p className="text-gray-600 dark:text-gray-300">Trusted by leading pharmaceutical companies worldwide for mission-critical supply chain operations.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600/10 to-blue-600/10 backdrop-blur-sm border border-green-200/20 dark:border-green-700/20 text-green-700 dark:text-green-300 px-4 py-2 rounded-full mb-8">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Ready to Get Started?</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Secure Your Supply Chain Today
              </span>
            </h2>
            
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-12 leading-relaxed">
              Join thousands of companies already using PharmaTrace to protect their pharmaceutical supply chains 
              and ensure patient safety worldwide.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200">
                <Link href="/dashboard" className="flex items-center gap-2">
                  Launch Dashboard
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              
              <Button asChild size="lg" variant="outline" className="border-2 border-purple-200 dark:border-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
                <Link href="/scan" className="flex items-center gap-2">
                  <Scan className="h-5 w-5" />
                  Try QR Scanner
                </Link>
              </Button>
            </div>

            {/* Trust badges */}
            <div className="mt-16 flex flex-wrap justify-center items-center gap-8 opacity-60">
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                <Lock className="h-5 w-5" />
                <span className="text-sm font-medium">SOC 2 Compliant</span>
              </div>
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                <Shield className="h-5 w-5" />
                <span className="text-sm font-medium">FDA Approved</span>
              </div>
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                <Award className="h-5 w-5" />
                <span className="text-sm font-medium">ISO 27001</span>
              </div>
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                <Star className="h-5 w-5" />
                <span className="text-sm font-medium">99.9% Uptime</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold">PharmaTrace</span>
              </div>
              <p className="text-gray-400 text-sm">
                Securing pharmaceutical supply chains with blockchain technology.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
                <li><Link href="/register" className="hover:text-white transition-colors">Register Batch</Link></li>
                <li><Link href="/scan" className="hover:text-white transition-colors">QR Scanner</Link></li>
                <li><Link href="/transfer" className="hover:text-white transition-colors">Transfer</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Compliance</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 PharmaTrace. All rights reserved. Built with ❤️ for pharmaceutical safety.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}