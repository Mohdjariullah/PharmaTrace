"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { 
  Cookie, 
  Settings, 
  BarChart3, 
  Shield, 
  Globe,
  Calendar,
  Info,
  CheckCircle,
  AlertTriangle
} from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const cookieCategories = [
  {
    id: "essential",
    title: "Essential Cookies",
    icon: Shield,
    required: true,
    description: "These cookies are necessary for the website to function and cannot be switched off.",
    examples: [
      "Authentication and session management",
      "Security and fraud prevention",
      "Load balancing and performance",
      "Basic functionality and navigation"
    ],
    retention: "Session or up to 1 year",
    color: "from-green-500 to-emerald-500"
  },
  {
    id: "functional",
    title: "Functional Cookies",
    icon: Settings,
    required: false,
    description: "These cookies enable enhanced functionality and personalization.",
    examples: [
      "User preferences and settings",
      "Language and region selection",
      "Theme and display preferences",
      "Wallet connection preferences"
    ],
    retention: "Up to 2 years",
    color: "from-blue-500 to-cyan-500"
  },
  {
    id: "analytics",
    title: "Analytics Cookies",
    icon: BarChart3,
    required: false,
    description: "These cookies help us understand how visitors interact with our website.",
    examples: [
      "Page views and user journeys",
      "Feature usage and performance metrics",
      "Error tracking and debugging",
      "A/B testing and optimization"
    ],
    retention: "Up to 2 years",
    color: "from-purple-500 to-pink-500"
  },
  {
    id: "marketing",
    title: "Marketing Cookies",
    icon: Globe,
    required: false,
    description: "These cookies are used to track visitors across websites for marketing purposes.",
    examples: [
      "Advertising campaign effectiveness",
      "Social media integration",
      "Cross-site tracking prevention",
      "Personalized content delivery"
    ],
    retention: "Up to 1 year",
    color: "from-orange-500 to-red-500"
  }
];

const thirdPartyServices = [
  {
    name: "Google Analytics",
    purpose: "Website analytics and user behavior tracking",
    cookies: "_ga, _ga_*, _gid",
    privacy: "https://policies.google.com/privacy"
  },
  {
    name: "Solana Blockchain",
    purpose: "Blockchain interaction and transaction processing",
    cookies: "solana_network, wallet_preference",
    privacy: "https://solana.com/privacy-policy"
  },
  {
    name: "Supabase",
    purpose: "Database and authentication services",
    cookies: "sb-*, supabase-auth-token",
    privacy: "https://supabase.com/privacy"
  },
  {
    name: "Vercel",
    purpose: "Website hosting and performance optimization",
    cookies: "__vercel_live_token, _vercel_jwt",
    privacy: "https://vercel.com/legal/privacy-policy"
  }
];

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 border-blue-200">
              Cookie Policy
            </Badge>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Cookie Policy
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
              Learn about how PharmaTrace uses cookies and similar technologies 
              to enhance your experience and improve our services.
            </p>
            
            <div className="flex items-center justify-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Last updated: January 15, 2025</span>
              </div>
              <div className="flex items-center gap-2">
                <Cookie className="h-4 w-4" />
                <span>GDPR & CCPA Compliant</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What Are Cookies */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="border-2 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
                  <Info className="h-6 w-6" />
                  What Are Cookies?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-blue-800 dark:text-blue-200 mb-4">
                  Cookies are small text files that are stored on your device when you visit a website. 
                  They help websites remember your preferences, improve functionality, and provide analytics 
                  about how the site is used.
                </p>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">How We Use Cookies</h4>
                    <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                      <li>• Remember your wallet connection preferences</li>
                      <li>• Maintain your session and security</li>
                      <li>• Analyze website performance and usage</li>
                      <li>• Provide personalized experiences</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Your Control</h4>
                    <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                      <li>• You can control cookie settings below</li>
                      <li>• Browser settings allow cookie management</li>
                      <li>• Some cookies are essential for functionality</li>
                      <li>• You can withdraw consent at any time</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Cookie Categories & Settings */}
      <section className="py-24 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-6">
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Cookie Categories & Settings
                </span>
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                Manage your cookie preferences for each category
              </p>
            </div>

            <div className="space-y-6">
              {cookieCategories.map((category, index) => (
                <Card key={index} className="border-0 shadow-lg">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${category.color} flex items-center justify-center`}>
                          <category.icon className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-xl">{category.title}</CardTitle>
                          {category.required && (
                            <Badge variant="secondary" className="mt-1">Required</Badge>
                          )}
                        </div>
                      </div>
                      <Switch 
                        checked={category.required ? true : undefined}
                        disabled={category.required}
                      />
                
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      {category.description}
                    </p>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Examples</h4>
                        <ul className="space-y-1">
                          {category.examples.map((example, exampleIndex) => (
                            <li key={exampleIndex} className="flex items-start gap-2 text-sm">
                              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-600 dark:text-gray-300">{example}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Retention Period</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                          {category.retention}
                        </p>
                        
                        {category.required && (
                          <div className="p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg border border-yellow-200 dark:border-yellow-800">
                            <div className="flex items-start gap-2">
                              <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                              <p className="text-xs text-yellow-800 dark:text-yellow-200">
                                These cookies are essential for the website to function properly and cannot be disabled.
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center mt-8">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  Save Preferences
                </Button>
                <Button size="lg" variant="outline">
                  Accept All Cookies
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Third-Party Services */}
      <section className="py-24 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-6">
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Third-Party Services
                </span>
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                External services that may set cookies on our website
              </p>
            </div>

            <div className="grid gap-6">
              {thirdPartyServices.map((service, index) => (
                <Card key={index} className="border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                          {service.name}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 text-sm">
                          {service.purpose}
                        </p>
                      </div>
                      <Button asChild variant="outline" size="sm">
                        <a href={service.privacy} target="_blank" rel="noopener noreferrer">
                          Privacy Policy
                        </a>
                      </Button>
                    </div>
                    
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        <strong>Cookies:</strong>
                      </div>
                      <code className="text-xs font-mono text-gray-800 dark:text-gray-200">
                        {service.cookies}
                      </code>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Managing Cookies */}
      <section className="py-24 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-6">
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Managing Your Cookies
                </span>
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-blue-600" />
                    Browser Settings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    You can control cookies through your browser settings:
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                      <span>Block all cookies or specific types</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                      <span>Delete existing cookies</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                      <span>Set notifications for new cookies</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                      <span>Configure privacy settings</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                    Important Notes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Please be aware that:
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5" />
                      <span>Blocking essential cookies may affect functionality</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5" />
                      <span>Some features may not work without cookies</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5" />
                      <span>Preferences may not be saved</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5" />
                      <span>Analytics data may be incomplete</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <div className="text-center mt-12">
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Need help managing your cookie preferences?
              </p>
              <Button asChild size="lg" variant="outline">
                <Link href="/support">
                  Contact Support
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}