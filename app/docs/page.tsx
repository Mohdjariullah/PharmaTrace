"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Book, 
  Code, 
  Zap, 
  Shield, 
  ArrowRight,
  Package,
  Scan,
  Repeat,
  BarChart3,
  ExternalLink,
  Download,
  Play,
  CheckCircle
} from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const quickStart = [
  {
    step: "1",
    title: "Connect Wallet",
    description: "Connect your Solana wallet (Phantom, Solflare) to get started",
    icon: Shield,
    color: "from-blue-500 to-cyan-500"
  },
  {
    step: "2", 
    title: "Register Batch",
    description: "Create your first pharmaceutical batch with product details",
    icon: Package,
    color: "from-purple-500 to-pink-500"
  },
  {
    step: "3",
    title: "Generate QR",
    description: "Get a unique QR code for your batch verification",
    icon: Scan,
    color: "from-green-500 to-emerald-500"
  },
  {
    step: "4",
    title: "Verify & Track",
    description: "Scan QR codes to verify authenticity and track ownership",
    icon: BarChart3,
    color: "from-orange-500 to-red-500"
  }
];

const apiEndpoints = [
  {
    method: "POST",
    endpoint: "/api/batches",
    description: "Register a new pharmaceutical batch",
    badge: "Core"
  },
  {
    method: "GET",
    endpoint: "/api/batches/{id}",
    description: "Retrieve batch information by ID",
    badge: "Core"
  },
  {
    method: "POST",
    endpoint: "/api/verify",
    description: "Verify batch authenticity via transaction signature",
    badge: "Core"
  },
  {
    method: "POST",
    endpoint: "/api/transfer",
    description: "Transfer batch ownership to new wallet",
    badge: "Core"
  },
  {
    method: "GET",
    endpoint: "/api/analytics",
    description: "Get supply chain analytics and insights",
    badge: "Pro"
  }
];

const guides = [
  {
    title: "Getting Started Guide",
    description: "Complete walkthrough for new users",
    duration: "10 min read",
    level: "Beginner",
    icon: Book,
    href: "#"
  },
  {
    title: "Batch Registration",
    description: "How to register pharmaceutical batches",
    duration: "5 min read", 
    level: "Beginner",
    icon: Package,
    href: "#"
  },
  {
    title: "QR Code Integration",
    description: "Implementing QR verification in your app",
    duration: "15 min read",
    level: "Intermediate",
    icon: Scan,
    href: "#"
  },
  {
    title: "Supply Chain Tracking",
    description: "Advanced tracking and analytics features",
    duration: "20 min read",
    level: "Advanced",
    icon: BarChart3,
    href: "#"
  }
];

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 border-blue-200">
              Documentation
            </Badge>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Developer Resources
              </span>
              <br />
              <span className="text-gray-900 dark:text-white">
                & Documentation
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
              Everything you need to integrate PharmaTrace into your pharmaceutical 
              supply chain operations. From quick start guides to advanced API references.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Link href="#quick-start">
                  <Play className="mr-2 h-5 w-5" />
                  Quick Start
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="#api-reference">
                  <Code className="mr-2 h-5 w-5" />
                  API Reference
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Start Section */}
      <section id="quick-start" className="py-24 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Quick Start Guide
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Get up and running with PharmaTrace in just a few minutes
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {quickStart.map((step, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-0 relative overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-br ${step.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
                
                <CardHeader className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${step.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                      <step.icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-2xl font-bold text-gray-300 dark:text-gray-600">
                      {step.step}
                    </div>
                  </div>
                  <CardTitle className="text-xl">{step.title}</CardTitle>
                </CardHeader>
                
                <CardContent className="relative">
                  <p className="text-gray-600 dark:text-gray-300">{step.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button asChild size="lg" variant="outline">
              <Link href="/dashboard">
                Try It Now <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Documentation Tabs */}
      <section className="py-24 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <Tabs defaultValue="guides" className="max-w-6xl mx-auto">
            <TabsList className="grid w-full grid-cols-3 mb-12">
              <TabsTrigger value="guides" className="flex items-center gap-2">
                <Book className="h-4 w-4" />
                Guides
              </TabsTrigger>
              <TabsTrigger value="api" className="flex items-center gap-2">
                <Code className="h-4 w-4" />
                API Reference
              </TabsTrigger>
              <TabsTrigger value="examples" className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Examples
              </TabsTrigger>
            </TabsList>

            <TabsContent value="guides">
              <div className="grid md:grid-cols-2 gap-8">
                {guides.map((guide, index) => (
                  <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-0">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                          <guide.icon className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{guide.title}</h3>
                            <Badge variant="secondary" className="text-xs">{guide.level}</Badge>
                          </div>
                          <p className="text-gray-600 dark:text-gray-300 mb-3">{guide.description}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">{guide.duration}</span>
                            <Button asChild variant="ghost" size="sm">
                              <Link href={guide.href}>
                                Read More <ExternalLink className="ml-1 h-4 w-4" />
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="api" id="api-reference">
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">API Endpoints</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    RESTful API for integrating PharmaTrace into your applications
                  </p>
                </div>

                {apiEndpoints.map((endpoint, index) => (
                  <Card key={index} className="border-0 shadow-lg">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <Badge 
                            variant={endpoint.method === 'GET' ? 'secondary' : 'default'}
                            className={`font-mono ${
                              endpoint.method === 'GET' ? 'bg-green-100 text-green-700' : 
                              endpoint.method === 'POST' ? 'bg-blue-100 text-blue-700' : 
                              'bg-orange-100 text-orange-700'
                            }`}
                          >
                            {endpoint.method}
                          </Badge>
                          <code className="text-lg font-mono text-gray-900 dark:text-white">
                            {endpoint.endpoint}
                          </code>
                        </div>
                        <Badge variant="outline">{endpoint.badge}</Badge>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300">{endpoint.description}</p>
                    </CardContent>
                  </Card>
                ))}

                <div className="text-center mt-8">
                  <Button asChild size="lg" variant="outline">
                    <Link href="/api-docs">
                      <Download className="mr-2 h-4 w-4" />
                      Download OpenAPI Spec
                    </Link>
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="examples">
              <div className="grid md:grid-cols-2 gap-8">
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Code className="h-5 w-5 text-blue-600" />
                      JavaScript SDK
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gray-900 rounded-lg p-4 mb-4">
                      <code className="text-green-400 text-sm">
                        {`npm install @pharmatrace/sdk

import { PharmaTrace } from '@pharmatrace/sdk';

const client = new PharmaTrace({
  apiKey: 'your-api-key'
});

// Register a batch
const batch = await client.registerBatch({
  batchId: 'BATCH123',
  productName: 'Medicine Name',
  mfgDate: '2024-01-01',
  expDate: '2025-01-01'
});`}
                      </code>
                    </div>
                    <Button asChild variant="outline" size="sm">
                      <Link href="#">
                        View Full Example <ExternalLink className="ml-1 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Scan className="h-5 w-5 text-purple-600" />
                      QR Verification
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gray-900 rounded-lg p-4 mb-4">
                      <code className="text-green-400 text-sm">
                        {`// Verify a batch via QR scan
const verification = await client.verify({
  txSignature: 'transaction-hash'
});

if (verification.isValid) {
  console.log('Batch is authentic');
  console.log(verification.batch);
} else {
  console.log('Invalid batch');
}`}
                      </code>
                    </div>
                    <Button asChild variant="outline" size="sm">
                      <Link href="#">
                        View Full Example <ExternalLink className="ml-1 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Resources Section */}
      <section className="py-24 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Additional Resources
              </span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="group hover:shadow-xl transition-all duration-300 border-0">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <Book className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Knowledge Base</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Comprehensive articles and tutorials covering all aspects of pharmaceutical tracking
                </p>
                <Button asChild variant="outline" size="sm">
                  <Link href="#">
                    Browse Articles <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 border-0">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <Play className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Video Tutorials</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Step-by-step video guides for getting started and advanced features
                </p>
                <Button asChild variant="outline" size="sm">
                  <Link href="#">
                    Watch Videos <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 border-0">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <Download className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Downloads</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  SDKs, code samples, and integration tools for developers
                </p>
                <Button asChild variant="outline" size="sm">
                  <Link href="#">
                    Download Tools <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}