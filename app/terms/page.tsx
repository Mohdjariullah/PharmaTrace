"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Scale, 
  Shield, 
  AlertTriangle, 
  CheckCircle,
  Calendar,
  Mail,
  Globe,
  Users,
  Zap
} from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const sections = [
  {
    id: "acceptance",
    title: "Acceptance of Terms",
    icon: CheckCircle,
    content: `By accessing or using PharmaTrace, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this service. The materials contained in this website are protected by applicable copyright and trademark law.`
  },
  {
    id: "service-description",
    title: "Service Description",
    icon: Zap,
    content: `PharmaTrace is a blockchain-based pharmaceutical supply chain tracking platform that enables:
    
    • Registration of pharmaceutical batches on the Solana blockchain
    • Verification of product authenticity through QR code scanning
    • Tracking of ownership transfers throughout the supply chain
    • Regulatory compliance tools and analytics
    • Real-time monitoring and flagging capabilities
    
    Our service is designed to enhance pharmaceutical security and regulatory compliance but does not replace professional medical advice or regulatory oversight.`
  },
  {
    id: "user-accounts",
    title: "User Accounts & Responsibilities",
    icon: Users,
    content: `When using PharmaTrace, you are responsible for:
    
    • Maintaining the security of your Solana wallet and private keys
    • Providing accurate and complete information when registering batches
    • Complying with all applicable pharmaceutical regulations and laws
    • Not using the service for any illegal or unauthorized purpose
    • Respecting the intellectual property rights of others
    • Maintaining the confidentiality of any sensitive information
    
    You acknowledge that loss of wallet access may result in permanent loss of access to your registered batches.`
  },
  {
    id: "blockchain-transactions",
    title: "Blockchain Transactions",
    icon: Shield,
    content: `All batch registrations and transfers are recorded on the Solana blockchain. You understand and agree that:
    
    • Blockchain transactions are irreversible and permanent
    • Transaction fees (gas fees) are required for all blockchain operations
    • Network congestion may affect transaction processing times
    • We do not control the Solana blockchain or its operation
    • Blockchain data is publicly accessible and transparent
    • Smart contract interactions carry inherent technical risks
    
    We are not responsible for any losses resulting from blockchain network issues or wallet management errors.`
  },
  {
    id: "prohibited-uses",
    title: "Prohibited Uses",
    icon: AlertTriangle,
    content: `You may not use PharmaTrace for any of the following prohibited activities:
    
    • Registering false, misleading, or fraudulent batch information
    • Attempting to circumvent or manipulate the verification system
    • Using the service to facilitate illegal drug trafficking or distribution
    • Interfering with or disrupting the service or servers
    • Attempting to gain unauthorized access to other users' accounts
    • Violating any applicable laws, regulations, or third-party rights
    • Creating fake or duplicate batch registrations
    • Using automated systems to abuse the service
    
    Violation of these terms may result in immediate termination of your access.`
  },
  {
    id: "intellectual-property",
    title: "Intellectual Property",
    icon: Scale,
    content: `The PharmaTrace platform, including its design, code, content, and trademarks, is owned by PharmaTrace and protected by intellectual property laws. You are granted a limited, non-exclusive, non-transferable license to use the service for its intended purpose.
    
    You retain ownership of any data you submit to the platform, but grant us a license to use, store, and process this data to provide our services. You represent that you have the right to submit any information you provide to the platform.`
  },
  {
    id: "disclaimers",
    title: "Disclaimers & Limitations",
    icon: AlertTriangle,
    content: `PharmaTrace is provided "as is" without any warranties, express or implied. We disclaim all warranties including:
    
    • Merchantability, fitness for a particular purpose, and non-infringement
    • Accuracy, reliability, or completeness of information
    • Uninterrupted or error-free operation of the service
    • Security of data transmission or storage
    
    We are not liable for any indirect, incidental, special, or consequential damages arising from your use of the service. Our total liability is limited to the amount you paid for the service in the preceding 12 months.`
  },
  {
    id: "regulatory-compliance",
    title: "Regulatory Compliance",
    icon: Globe,
    content: `While PharmaTrace is designed to support regulatory compliance, you remain solely responsible for:
    
    • Ensuring compliance with all applicable pharmaceutical regulations
    • Obtaining necessary licenses and approvals for your operations
    • Maintaining proper documentation and audit trails
    • Reporting to regulatory authorities as required
    • Following good manufacturing and distribution practices
    
    PharmaTrace does not provide legal or regulatory advice. Consult with qualified professionals for compliance guidance.`
  }
];

const keyTerms = [
  {
    term: "Batch",
    definition: "A specific quantity of pharmaceutical product manufactured under uniform conditions"
  },
  {
    term: "Blockchain Verification",
    definition: "The process of confirming transaction authenticity using cryptographic proof on the Solana blockchain"
  },
  {
    term: "QR Code",
    definition: "A machine-readable code containing batch information and blockchain transaction references"
  },
  {
    term: "Supply Chain",
    definition: "The network of entities involved in the production, handling, and distribution of pharmaceutical products"
  },
  {
    term: "Wallet",
    definition: "A digital tool for managing cryptocurrency and interacting with blockchain applications"
  }
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 border-blue-200">
              Terms of Service
            </Badge>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Terms of Service
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
              Please read these terms carefully before using PharmaTrace. 
              These terms govern your use of our pharmaceutical tracking platform.
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
                  <FileText className="h-6 w-6" />
                  Terms Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Your Responsibilities</h4>
                    <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                      <li>• Secure your wallet and private keys</li>
                      <li>• Provide accurate batch information</li>
                      <li>• Comply with pharmaceutical regulations</li>
                      <li>• Use the service lawfully</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Our Service</h4>
                    <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                      <li>• Blockchain-based tracking platform</li>
                      <li>• QR code verification system</li>
                      <li>• Supply chain transparency tools</li>
                      <li>• Regulatory compliance features</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Important Notes</h4>
                    <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                      <li>• Blockchain transactions are permanent</li>
                      <li>• Service provided "as is"</li>
                      <li>• You remain responsible for compliance</li>
                      <li>• Terms may be updated periodically</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Main Terms Content */}
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
                <CardContent>
                  <div className="prose prose-gray dark:prose-invert max-w-none">
                    {section.content.split('\n').map((paragraph, pIndex) => (
                      <p key={pIndex} className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4 last:mb-0">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Key Terms Definitions */}
      <section className="py-24 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-6">
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Key Terms & Definitions
                </span>
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                Understanding important terminology used in these terms
              </p>
            </div>

            <div className="space-y-4">
              {keyTerms.map((item, index) => (
                <Card key={index} className="border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-3 flex-shrink-0"></div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                          {item.term}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300">
                          {item.definition}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact & Changes */}
      <section className="py-24 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5 text-blue-600" />
                    Questions About Terms?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    If you have any questions about these Terms of Service, please contact us.
                  </p>
                  <div className="space-y-2 text-sm">
                    <div>
                      <strong>Legal Team:</strong> legal@pharmatrace.com
                    </div>
                    <div>
                      <strong>General Support:</strong> support@pharmatrace.com
                    </div>
                    <div>
                      <strong>Business Inquiries:</strong> business@pharmatrace.com
                    </div>
                  </div>
                  <Button asChild className="mt-4" variant="outline">
                    <Link href="/support">
                      Contact Support
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-purple-600" />
                    Changes to Terms
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    We may revise these terms from time to time. We'll notify users of any material changes.
                  </p>
                  <div className="space-y-2 text-sm">
                    <div>
                      <strong>Current Version:</strong> 3.1
                    </div>
                    <div>
                      <strong>Effective Date:</strong> January 15, 2025
                    </div>
                    <div>
                      <strong>Previous Version:</strong> December 1, 2024
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      <strong>Notice:</strong> Continued use of the service after changes constitutes acceptance of the new terms.
                    </p>
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