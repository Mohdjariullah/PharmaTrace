"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  MessageCircle, 
  Mail, 
  Phone, 
  Clock, 
  HelpCircle,
  Zap,
  Shield,
  Users,
  ArrowRight,
  Send,
  CheckCircle,
  AlertCircle,
  Info
} from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const supportChannels = [
  {
    icon: MessageCircle,
    title: "Live Chat",
    description: "Get instant help from our support team",
    availability: "24/7 Available",
    response: "< 2 minutes",
    color: "from-blue-500 to-cyan-500",
    action: "Start Chat"
  },
  {
    icon: Mail,
    title: "Email Support", 
    description: "Send us detailed questions and get comprehensive answers",
    availability: "Business Hours",
    response: "< 4 hours",
    color: "from-purple-500 to-pink-500",
    action: "Send Email"
  },
  {
    icon: Phone,
    title: "Phone Support",
    description: "Speak directly with our technical experts",
    availability: "Mon-Fri 9AM-6PM EST",
    response: "Immediate",
    color: "from-green-500 to-emerald-500",
    action: "Call Now"
  }
];

const faqCategories = [
  {
    title: "Getting Started",
    icon: Zap,
    questions: [
      {
        q: "How do I connect my Solana wallet?",
        a: "Click the 'Connect Wallet' button in the top right corner and select your preferred wallet (Phantom, Solflare, etc.). Make sure you have the wallet extension installed."
      },
      {
        q: "What are the system requirements?",
        a: "PharmaTrace works on any modern web browser. You'll need a Solana wallet and a small amount of SOL for transaction fees (typically 0.001-0.01 SOL per transaction)."
      },
      {
        q: "How much does it cost to register a batch?",
        a: "Batch registration costs approximately 0.001 SOL (~$0.10) in transaction fees. There are no additional platform fees for basic usage."
      }
    ]
  },
  {
    title: "Security & Compliance",
    icon: Shield,
    questions: [
      {
        q: "How secure is the blockchain verification?",
        a: "All batch data is stored on the Solana blockchain, which provides cryptographic security and immutability. Once registered, batch information cannot be altered or deleted."
      },
      {
        q: "Is PharmaTrace compliant with pharmaceutical regulations?",
        a: "Yes, PharmaTrace is designed to meet FDA, EMA, and other international pharmaceutical tracking requirements. We provide audit trails and compliance reporting features."
      },
      {
        q: "What happens if I lose access to my wallet?",
        a: "Wallet recovery depends on your wallet provider's backup mechanisms. We recommend securely storing your seed phrase. Contact support for guidance on batch ownership transfer procedures."
      }
    ]
  },
  {
    title: "Technical Issues",
    icon: Users,
    questions: [
      {
        q: "Why is my transaction failing?",
        a: "Common causes include insufficient SOL balance, network congestion, or wallet connection issues. Check your SOL balance and try again. Contact support if issues persist."
      },
      {
        q: "QR code scanning isn't working",
        a: "Ensure your camera permissions are enabled and the QR code is clearly visible. You can also upload an image of the QR code or manually enter the transaction signature."
      },
      {
        q: "How do I transfer batch ownership?",
        a: "Go to the Transfer page, select your batch, enter the new owner's wallet address, and confirm the transaction. Both parties will see the ownership change immediately."
      }
    ]
  }
];

const supportPlans = [
  {
    name: "Community",
    price: "Free",
    description: "Basic support for individual users",
    features: [
      "Community forum access",
      "Email support (48h response)",
      "Basic documentation",
      "Self-service resources"
    ],
    badge: "Free",
    color: "border-gray-200"
  },
  {
    name: "Professional", 
    price: "$99/month",
    description: "Priority support for businesses",
    features: [
      "Priority email support (4h response)",
      "Live chat support",
      "Phone support (business hours)",
      "Advanced documentation",
      "Integration assistance"
    ],
    badge: "Popular",
    color: "border-blue-500"
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "Dedicated support for large organizations",
    features: [
      "24/7 dedicated support",
      "Assigned customer success manager",
      "Custom integration support",
      "SLA guarantees",
      "On-site training available"
    ],
    badge: "Enterprise",
    color: "border-purple-500"
  }
];

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 border-blue-200">
              Support Center
            </Badge>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                We're Here to Help
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
              Get the support you need to successfully implement and use PharmaTrace 
              in your pharmaceutical supply chain operations.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <MessageCircle className="mr-2 h-5 w-5" />
                Start Live Chat
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="#contact">
                  Contact Support
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Support Channels */}
      <section className="py-24 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Get Support Your Way
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Choose the support channel that works best for you
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {supportChannels.map((channel, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-0 relative overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-br ${channel.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
                
                <CardHeader className="relative text-center">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r ${channel.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                    <channel.icon className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl">{channel.title}</CardTitle>
                </CardHeader>
                
                <CardContent className="relative text-center">
                  <p className="text-gray-600 dark:text-gray-300 mb-6">{channel.description}</p>
                  
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center justify-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600 dark:text-gray-400">{channel.availability}</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-sm">
                      <Zap className="h-4 w-4 text-green-500" />
                      <span className="text-gray-600 dark:text-gray-400">Response: {channel.response}</span>
                    </div>
                  </div>
                  
                  <Button className="w-full">
                    {channel.action} <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Frequently Asked Questions
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Find quick answers to common questions about PharmaTrace
            </p>
          </div>

          <div className="space-y-12">
            {faqCategories.map((category, categoryIndex) => (
              <div key={categoryIndex}>
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-xl flex items-center justify-center">
                    <category.icon className="h-5 w-5 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{category.title}</h3>
                </div>
                
                <div className="grid gap-6">
                  {category.questions.map((faq, faqIndex) => (
                    <Card key={faqIndex} className="border-0 shadow-lg">
                      <CardContent className="p-6">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-start gap-2">
                          <HelpCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                          {faq.q}
                        </h4>
                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed pl-7">{faq.a}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section id="contact" className="py-24 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-6">
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Contact Our Team
                </span>
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                Can't find what you're looking for? Send us a message and we'll get back to you.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12">
              {/* Contact Form */}
              <Card className="border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Send className="h-5 w-5 text-blue-600" />
                    Send us a Message
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        First Name
                      </label>
                      <Input placeholder="John" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Last Name
                      </label>
                      <Input placeholder="Doe" />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email Address
                    </label>
                    <Input type="email" placeholder="john@company.com" />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Company
                    </label>
                    <Input placeholder="Your Company Name" />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Subject
                    </label>
                    <Input placeholder="How can we help you?" />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Message
                    </label>
                    <Textarea 
                      placeholder="Please describe your question or issue in detail..."
                      rows={6}
                    />
                  </div>
                  
                  <Button size="lg" className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    <Send className="mr-2 h-5 w-5" />
                    Send Message
                  </Button>
                </CardContent>
              </Card>

              {/* Support Plans */}
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Support Plans</h3>
                
                {supportPlans.map((plan, index) => (
                  <Card key={index} className={`border-2 ${plan.color} hover:shadow-lg transition-all duration-200`}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="text-lg font-bold text-gray-900 dark:text-white">{plan.name}</h4>
                          <p className="text-gray-600 dark:text-gray-400 text-sm">{plan.description}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-900 dark:text-white">{plan.price}</div>
                          <Badge variant="secondary">{plan.badge}</Badge>
                        </div>
                      </div>
                      
                      <ul className="space-y-2">
                        {plan.features.map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-center gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                            <span className="text-gray-600 dark:text-gray-300">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      
                      <Button variant="outline" size="sm" className="w-full mt-4">
                        {plan.name === 'Enterprise' ? 'Contact Sales' : 'Get Started'}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Status & Resources */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg text-center">
              <CardContent className="p-6">
                <div className="w-12 h-12 mx-auto mb-4 bg-green-100 dark:bg-green-900 rounded-xl flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">System Status</h3>
                <p className="text-green-600 font-medium mb-2">All Systems Operational</p>
                <Button asChild variant="outline" size="sm">
                  <Link href="#">View Status Page</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg text-center">
              <CardContent className="p-6">
                <div className="w-12 h-12 mx-auto mb-4 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center">
                  <Info className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Knowledge Base</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">Browse our comprehensive guides</p>
                <Button asChild variant="outline" size="sm">
                  <Link href="/docs">Browse Articles</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg text-center">
              <CardContent className="p-6">
                <div className="w-12 h-12 mx-auto mb-4 bg-purple-100 dark:bg-purple-900 rounded-xl flex items-center justify-center">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Community Forum</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">Connect with other users</p>
                <Button asChild variant="outline" size="sm">
                  <Link href="#">Join Community</Link>
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