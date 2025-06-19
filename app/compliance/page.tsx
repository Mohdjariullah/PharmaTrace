"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Shield, 
  CheckCircle, 
  FileText, 
  Globe, 
  Award,
  Lock,
  Eye,
  Users,
  Calendar,
  Download,
  ExternalLink,
  AlertTriangle
} from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const regulations = [
  {
    name: "FDA CFR Title 21",
    region: "United States",
    description: "Food and Drug Administration regulations for pharmaceutical manufacturing and distribution",
    status: "Compliant",
    icon: Shield,
    color: "from-green-500 to-emerald-500"
  },
  {
    name: "EU GDP Guidelines",
    region: "European Union",
    description: "Good Distribution Practice guidelines for medicinal products",
    status: "Compliant",
    icon: CheckCircle,
    color: "from-blue-500 to-cyan-500"
  },
  {
    name: "ICH Q10",
    region: "International",
    description: "International Council for Harmonisation pharmaceutical quality system",
    status: "Compliant",
    icon: Globe,
    color: "from-purple-500 to-pink-500"
  },
  {
    name: "DSCSA",
    region: "United States",
    description: "Drug Supply Chain Security Act requirements for traceability",
    status: "Compliant",
    icon: FileText,
    color: "from-orange-500 to-red-500"
  },
  {
    name: "WHO Guidelines",
    region: "Global",
    description: "World Health Organization guidelines for pharmaceutical distribution",
    status: "Compliant",
    icon: Award,
    color: "from-indigo-500 to-purple-500"
  },
  {
    name: "GDPR",
    region: "European Union",
    description: "General Data Protection Regulation for data privacy and security",
    status: "Compliant",
    icon: Lock,
    color: "from-teal-500 to-blue-500"
  }
];

const certifications = [
  {
    name: "SOC 2 Type II",
    issuer: "AICPA",
    description: "Security, availability, and confidentiality controls audit",
    validUntil: "December 2025",
    status: "Active"
  },
  {
    name: "ISO 27001",
    issuer: "ISO",
    description: "Information security management system certification",
    validUntil: "March 2026",
    status: "Active"
  },
  {
    name: "HIPAA Compliance",
    issuer: "HHS",
    description: "Health Insurance Portability and Accountability Act compliance",
    validUntil: "Ongoing",
    status: "Active"
  },
  {
    name: "FDA 21 CFR Part 11",
    issuer: "FDA",
    description: "Electronic records and electronic signatures compliance",
    validUntil: "Ongoing",
    status: "Active"
  }
];

const auditFeatures = [
  {
    title: "Immutable Audit Trails",
    description: "All transactions are permanently recorded on the Solana blockchain",
    icon: Lock
  },
  {
    title: "Real-time Monitoring",
    description: "Continuous monitoring of supply chain activities and compliance status",
    icon: Eye
  },
  {
    title: "Automated Reporting",
    description: "Generate compliance reports automatically for regulatory submissions",
    icon: FileText
  },
  {
    title: "Role-based Access",
    description: "Granular permissions and access controls for different user types",
    icon: Users
  },
  {
    title: "Data Integrity",
    description: "Cryptographic verification ensures data cannot be tampered with",
    icon: Shield
  },
  {
    title: "Regulatory Alerts",
    description: "Automated notifications for compliance issues and regulatory changes",
    icon: AlertTriangle
  }
];

export default function CompliancePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 border-blue-200">
              Regulatory Compliance
            </Badge>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Built for
              </span>
              <br />
              <span className="text-gray-900 dark:text-white">
                Regulatory Compliance
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
              PharmaTrace is designed from the ground up to meet the strictest pharmaceutical 
              regulations and compliance requirements worldwide.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Download className="mr-2 h-5 w-5" />
                Download Compliance Guide
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/support">
                  Contact Compliance Team
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Compliance Overview */}
      <section className="py-24 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-6">
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Regulatory Standards
                </span>
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                We comply with major pharmaceutical regulations and standards across all jurisdictions
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {regulations.map((regulation, index) => (
                <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-0 relative overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-br ${regulation.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
                  
                  <CardHeader className="relative">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${regulation.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                        <regulation.icon className="h-6 w-6 text-white" />
                      </div>
                      <Badge className="bg-green-100 text-green-700 border-green-200">
                        {regulation.status}
                      </Badge>
                    </div>
                    
                    <CardTitle className="text-lg">{regulation.name}</CardTitle>
                    <div className="text-sm text-gray-500">{regulation.region}</div>
                  </CardHeader>
                  
                  <CardContent className="relative">
                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                      {regulation.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section className="py-24 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-6">
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Certifications & Audits
                </span>
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                Independent verification of our security and compliance practices
              </p>
            </div>

            <div className="grid gap-6">
              {certifications.map((cert, index) => (
                <Card key={index} className="border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-xl flex items-center justify-center">
                          <Award className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                            {cert.name}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-300 text-sm">
                            {cert.description}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            <span>Issued by: {cert.issuer}</span>
                            <span>Valid until: {cert.validUntil}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-green-100 text-green-700 border-green-200">
                          {cert.status}
                        </Badge>
                        <Button variant="ghost" size="sm">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Audit Features */}
      <section className="py-24 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-6">
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Compliance Features
                </span>
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                Built-in tools to ensure ongoing compliance and regulatory readiness
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {auditFeatures.map((feature, index) => (
                <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-0">
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                      <feature.icon className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Compliance Process */}
      <section className="py-24 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-6">
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Our Compliance Process
                </span>
              </h2>
            </div>

            <div className="space-y-8">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    Regulatory Assessment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    We continuously monitor regulatory changes and assess their impact on our platform. 
                    Our legal and compliance team works with regulatory experts to ensure ongoing compliance.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                      <span className="text-sm">Quarterly regulatory review and updates</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                      <span className="text-sm">Collaboration with regulatory consultants</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                      <span className="text-sm">Proactive compliance monitoring</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-green-600" />
                    Implementation & Testing
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    All compliance requirements are implemented through rigorous development and testing processes. 
                    We maintain comprehensive documentation and validation records.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                      <span className="text-sm">Automated compliance testing in CI/CD pipeline</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                      <span className="text-sm">Comprehensive validation documentation</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                      <span className="text-sm">Regular penetration testing and security audits</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5 text-purple-600" />
                    Monitoring & Reporting
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Continuous monitoring ensures ongoing compliance and enables rapid response to any issues. 
                    We provide comprehensive reporting tools for regulatory submissions.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                      <span className="text-sm">Real-time compliance monitoring dashboard</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                      <span className="text-sm">Automated regulatory reporting</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                      <span className="text-sm">Incident response and remediation tracking</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Compliance Team */}
      <section className="py-24 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Need Compliance Support?
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              Our compliance team is here to help you navigate regulatory requirements 
              and ensure your implementation meets all necessary standards.
            </p>
            
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-xl flex items-center justify-center">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    Compliance Documentation
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                    Access detailed compliance guides, validation documents, and regulatory mappings
                  </p>
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Download Resources
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900 rounded-xl flex items-center justify-center">
                    <Users className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    Expert Consultation
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                    Schedule a consultation with our compliance experts for personalized guidance
                  </p>
                  <Button variant="outline" size="sm">
                    <Calendar className="mr-2 h-4 w-4" />
                    Schedule Meeting
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Link href="/support">
                  Contact Compliance Team
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/docs">
                  View Documentation
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