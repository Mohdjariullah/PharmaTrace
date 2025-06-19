"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Package, 
  Scan, 
  Repeat, 
  BarChart3, 
  ArrowRight, 
  CheckCircle,
  Shield,
  Zap
} from "lucide-react";
import Link from "next/link";

const steps = [
  {
    number: "01",
    icon: Package,
    title: "Register Batch",
    description: "Manufacturers register pharmaceutical batches with product details, expiry dates, and unique blockchain identifiers.",
    color: "from-blue-500 to-cyan-500",
    features: ["Immutable Records", "Batch Metadata", "QR Generation"]
  },
  {
    number: "02",
    icon: Scan,
    title: "Scan & Verify",
    description: "Anyone in the supply chain can scan QR codes to instantly verify authenticity and view complete history.",
    color: "from-purple-500 to-pink-500",
    features: ["Instant Verification", "Blockchain Lookup", "History Tracking"]
  },
  {
    number: "03",
    icon: Repeat,
    title: "Transfer Ownership",
    description: "Securely transfer batch ownership throughout the supply chain with cryptographic verification.",
    color: "from-green-500 to-emerald-500",
    features: ["Secure Transfer", "Ownership History", "Multi-party Validation"]
  },
  {
    number: "04",
    icon: BarChart3,
    title: "Monitor & Analyze",
    description: "Regulators and stakeholders access real-time analytics and can flag suspicious activities.",
    color: "from-orange-500 to-red-500",
    features: ["Real-time Analytics", "Regulatory Tools", "Compliance Monitoring"]
  }
];

export default function HowItWorksSection() {
  return (
    <section className="py-24 bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900/20 dark:to-blue-900/20 px-4 py-2 rounded-full mb-6">
            <Shield className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-700 dark:text-green-300">How It Works</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-gray-900 via-green-800 to-blue-800 dark:from-white dark:via-green-200 dark:to-blue-200 bg-clip-text text-transparent">
              Simple, Secure, and
            </span>
            <br />
            <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Transparent Process
            </span>
          </h2>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Our four-step process ensures complete pharmaceutical supply chain integrity 
            from manufacturer to patient.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {steps.map((step, index) => {
            const Icon = step.icon;
            
            return (
              <Card key={index} className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 bg-white dark:bg-gray-800">
                {/* Gradient Background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${step.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>
                
                {/* Step Number */}
                <div className="absolute top-6 right-6">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${step.color} flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                    {step.number}
                  </div>
                </div>
                
                <CardContent className="p-8 relative">
                  {/* Icon */}
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${step.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  
                  {/* Content */}
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 group-hover:bg-clip-text transition-all duration-300">
                    {step.title}
                  </h3>
                  
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                    {step.description}
                  </p>
                  
                  {/* Features */}
                  <div className="space-y-2">
                    {step.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Process Flow Visualization */}
        <div className="relative mb-16">
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-200 via-purple-200 to-green-200 dark:from-blue-800 dark:via-purple-800 dark:to-green-800 transform -translate-y-1/2"></div>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className={`w-16 h-16 mx-auto rounded-full bg-gradient-to-r ${step.color} flex items-center justify-center shadow-lg relative z-10`}>
                  <step.icon className="h-8 w-8 text-white" />
                </div>
                <div className="text-center mt-4">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">{step.title}</div>
                </div>
                
                {/* Arrow */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 -right-4 z-20">
                    <ArrowRight className="h-6 w-6 text-gray-400" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-8 border border-blue-100 dark:border-blue-800">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                <Zap className="h-8 w-8 text-white" />
              </div>
            </div>
            
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Ready to Secure Your Supply Chain?
            </h3>
            
            <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
              Join thousands of pharmaceutical companies already using PharmaTrace 
              to ensure product authenticity and regulatory compliance.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
                <Link href="/register" className="flex items-center gap-2">
                  Get Started Now
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              
              <Button asChild size="lg" variant="outline" className="border-2 border-purple-200 dark:border-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20">
                <Link href="/scan" className="flex items-center gap-2">
                  <Scan className="h-5 w-5" />
                  Try Demo
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}