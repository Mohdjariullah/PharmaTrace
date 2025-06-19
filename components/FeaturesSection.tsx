"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Package, 
  Scan, 
  BarChart3, 
  Repeat, 
  Shield, 
  Zap, 
  Globe, 
  Lock,
  CheckCircle,
  TrendingUp,
  Users,
  Clock
} from "lucide-react";

const features = [
  {
    icon: Package,
    title: "Batch Registration",
    description: "Securely register pharmaceutical batches with immutable blockchain records and comprehensive metadata tracking.",
    color: "from-blue-500 to-cyan-500",
    badge: "Core Feature"
  },
  {
    icon: Scan,
    title: "QR Code Verification",
    description: "Instantly verify product authenticity by scanning QR codes with real-time blockchain validation.",
    color: "from-purple-500 to-pink-500",
    badge: "Instant"
  },
  {
    icon: Repeat,
    title: "Ownership Transfer",
    description: "Seamlessly transfer batch ownership throughout the supply chain with cryptographic security.",
    color: "from-green-500 to-emerald-500",
    badge: "Secure"
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description: "Comprehensive insights and real-time monitoring for regulators and supply chain managers.",
    color: "from-orange-500 to-red-500",
    badge: "Pro"
  },
  {
    icon: Shield,
    title: "Regulatory Compliance",
    description: "Built-in compliance tools and flagging system for regulatory authorities and quality control.",
    color: "from-indigo-500 to-purple-500",
    badge: "Compliance"
  },
  {
    icon: Globe,
    title: "Global Network",
    description: "Worldwide pharmaceutical tracking with multi-language support and international standards.",
    color: "from-teal-500 to-blue-500",
    badge: "Global"
  }
];

const stats = [
  {
    icon: CheckCircle,
    value: "99.9%",
    label: "Verification Accuracy",
    color: "text-green-600"
  },
  {
    icon: Zap,
    value: "<2s",
    label: "Verification Speed",
    color: "text-yellow-600"
  },
  {
    icon: Lock,
    value: "256-bit",
    label: "Encryption Standard",
    color: "text-blue-600"
  },
  {
    icon: TrendingUp,
    value: "50M+",
    label: "Batches Tracked",
    color: "text-purple-600"
  }
];

export default function FeaturesSection() {
  return (
    <section className="py-24 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 px-4 py-2 rounded-full mb-6">
            <Zap className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Powerful Features</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent">
              Everything You Need for
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Pharmaceutical Tracking
            </span>
          </h2>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Our comprehensive platform provides all the tools needed to ensure pharmaceutical integrity, 
            from manufacturing to patient delivery.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => (
            <div key={index} className="text-center group">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stat.value}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            
            return (
              <Card key={index} className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-white dark:bg-gray-800">
                {/* Gradient Background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
                
                <CardHeader className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {feature.badge}
                    </Badge>
                  </div>
                  
                  <CardTitle className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 group-hover:bg-clip-text transition-all duration-300">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="relative">
                  <CardDescription className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-4">
            <Users className="h-4 w-4" />
            <span className="text-sm">Trusted by pharmaceutical companies worldwide</span>
          </div>
        </div>
      </div>
    </section>
  );
}