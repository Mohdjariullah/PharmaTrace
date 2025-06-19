"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Shield, 
  Lock, 
  Eye, 
  Database, 
  Globe, 
  Mail,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Info
} from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const sections = [
  {
    id: "information-collection",
    title: "Information We Collect",
    icon: Database,
    content: [
      {
        subtitle: "Account Information",
        items: [
          "Wallet addresses and public keys",
          "Email addresses (if provided)",
          "Company information (for business accounts)",
          "Usage preferences and settings"
        ]
      },
      {
        subtitle: "Blockchain Data",
        items: [
          "Transaction signatures and hashes",
          "Batch registration data",
          "Ownership transfer records",
          "Verification timestamps"
        ]
      },
      {
        subtitle: "Technical Information",
        items: [
          "IP addresses and device information",
          "Browser type and version",
          "Usage analytics and performance metrics",
          "Error logs and debugging information"
        ]
      }
    ]
  },
  {
    id: "data-usage",
    title: "How We Use Your Data",
    icon: Eye,
    content: [
      {
        subtitle: "Service Provision",
        items: [
          "Process batch registrations and transfers",
          "Verify pharmaceutical authenticity",
          "Maintain blockchain transaction records",
          "Provide customer support"
        ]
      },
      {
        subtitle: "Platform Improvement",
        items: [
          "Analyze usage patterns and performance",
          "Develop new features and functionality",
          "Enhance security and fraud prevention",
          "Optimize user experience"
        ]
      },
      {
        subtitle: "Legal Compliance",
        items: [
          "Comply with pharmaceutical regulations",
          "Respond to legal requests and investigations",
          "Maintain audit trails for compliance",
          "Prevent fraud and abuse"
        ]
      }
    ]
  },
  {
    id: "data-sharing",
    title: "Data Sharing & Disclosure",
    icon: Globe,
    content: [
      {
        subtitle: "Public Blockchain Data",
        items: [
          "Transaction signatures are publicly visible on Solana",
          "Batch verification data is accessible to all users",
          "Ownership transfer records are transparent",
          "No personal information is stored on-chain"
        ]
      },
      {
        subtitle: "Third-Party Services",
        items: [
          "Blockchain infrastructure providers (Solana)",
          "Analytics and monitoring services",
          "Customer support platforms",
          "Security and fraud prevention tools"
        ]
      },
      {
        subtitle: "Legal Requirements",
        items: [
          "Regulatory authorities when required by law",
          "Law enforcement for investigations",
          "Court orders and legal proceedings",
          "Compliance with pharmaceutical regulations"
        ]
      }
    ]
  },
  {
    id: "data-security",
    title: "Data Security",
    icon: Lock,
    content: [
      {
        subtitle: "Technical Safeguards",
        items: [
          "End-to-end encryption for sensitive data",
          "Secure HTTPS connections for all communications",
          "Regular security audits and penetration testing",
          "Multi-factor authentication for admin access"
        ]
      },
      {
        subtitle: "Blockchain Security",
        items: [
          "Cryptographic signatures for all transactions",
          "Immutable records on Solana blockchain",
          "Decentralized verification mechanisms",
          "No single point of failure"
        ]
      },
      {
        subtitle: "Access Controls",
        items: [
          "Role-based access permissions",
          "Regular access reviews and updates",
          "Secure key management practices",
          "Employee security training"
        ]
      }
    ]
  }
];

const rights = [
  {
    title: "Access Your Data",
    description: "Request a copy of all personal data we hold about you",
    icon: Eye
  },
  {
    title: "Correct Information",
    description: "Update or correct any inaccurate personal information",
    icon: CheckCircle
  },
  {
    title: "Delete Data",
    description: "Request deletion of your personal data (subject to legal requirements)",
    icon: AlertTriangle
  },
  {
    title: "Data Portability",
    description: "Receive your data in a structured, machine-readable format",
    icon: Database
  }
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 border-blue-200">
              Privacy Policy
            </Badge>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Your Privacy
              </span>
              <br />
              <span className="text-gray-900 dark:text-white">
                Matters to Us
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
              We are committed to protecting your privacy and being transparent about how we 
              collect, use, and protect your information in our pharmaceutical tracking platform.
            </p>
            
            <div className="flex items-center justify-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Last updated: January 15, 2025</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                <span>Effective globally</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Summary */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="border-2 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
                  <Info className="h-6 w-6" />
                  Privacy at a Glance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">What We Collect</h4>
                    <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                      <li>• Wallet addresses and transaction data</li>
                      <li>• Optional contact information</li>
                      <li>• Usage analytics and performance metrics</li>
                      <li>• Technical logs for security and debugging</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">How We Protect It</h4>
                    <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                      <li>• End-to-end encryption for sensitive data</li>
                      <li>• Blockchain immutability and security</li>
                      <li>• Regular security audits and monitoring</li>
                      <li>• Strict access controls and permissions</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-24 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-12">
            {sections.map((section, index) => (
              <Card key={index} id={section.id} className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-xl flex items-center justify-center">
                      <section.icon className="h-6 w-6 text-blue-600" />
                    </div>
                    {section.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {section.content.map((subsection, subIndex) => (
                    <div key={subIndex}>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                        {subsection.subtitle}
                      </h4>
                      <ul className="space-y-2">
                        {subsection.items.map((item, itemIndex) => (
                          <li key={itemIndex} className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-600 dark:text-gray-300">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Your Rights */}
      <section className="py-24 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-6">
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Your Privacy Rights
                </span>
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                You have control over your personal information
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {rights.map((right, index) => (
                <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-xl flex items-center justify-center">
                        <right.icon className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                          {right.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 text-sm">
                          {right.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center mt-12">
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                To exercise any of these rights, please contact our privacy team.
              </p>
              <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Link href="/support">
                  <Mail className="mr-2 h-5 w-5" />
                  Contact Privacy Team
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Contact & Updates */}
      <section className="py-24 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5 text-blue-600" />
                    Contact Us
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Have questions about our privacy practices? We're here to help.
                  </p>
                  <div className="space-y-2 text-sm">
                    <div>
                      <strong>Privacy Officer:</strong> privacy@pharmatrace.com
                    </div>
                    <div>
                      <strong>Data Protection:</strong> dpo@pharmatrace.com
                    </div>
                    <div>
                      <strong>General Support:</strong> support@pharmatrace.com
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-purple-600" />
                    Policy Updates
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    We may update this privacy policy from time to time. We'll notify you of any significant changes.
                  </p>
                  <div className="space-y-2 text-sm">
                    <div>
                      <strong>Current Version:</strong> 2.1
                    </div>
                    <div>
                      <strong>Last Updated:</strong> January 15, 2025
                    </div>
                    <div>
                      <strong>Next Review:</strong> July 2025
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}