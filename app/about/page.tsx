"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  Users, 
  Globe, 
  Award, 
  Target, 
  Heart,
  Zap,
  CheckCircle,
  ArrowRight,
  Linkedin,
  Twitter
} from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const values = [
  {
    icon: Shield,
    title: "Security First",
    description: "We prioritize the highest security standards to protect pharmaceutical supply chains worldwide.",
    color: "from-blue-500 to-cyan-500"
  },
  {
    icon: Heart,
    title: "Patient Safety",
    description: "Every decision we make is guided by our commitment to protecting patient health and safety.",
    color: "from-red-500 to-pink-500"
  },
  {
    icon: Globe,
    title: "Global Impact",
    description: "Building solutions that work across borders to create a safer pharmaceutical ecosystem.",
    color: "from-green-500 to-emerald-500"
  },
  {
    icon: Zap,
    title: "Innovation",
    description: "Leveraging cutting-edge blockchain technology to solve real-world pharmaceutical challenges.",
    color: "from-purple-500 to-indigo-500"
  }
];

const team = [
  {
    name: "Dr. Sarah Chen",
    role: "CEO & Co-Founder",
    bio: "Former pharmaceutical executive with 15+ years in supply chain management and regulatory compliance.",
    image: "https://images.pexels.com/photos/3760263/pexels-photo-3760263.jpeg?auto=compress&cs=tinysrgb&w=400",
    social: { linkedin: "#", twitter: "#" }
  },
  {
    name: "Marcus Rodriguez",
    role: "CTO & Co-Founder",
    bio: "Blockchain architect and former Solana core contributor with expertise in distributed systems.",
    image: "https://images.pexels.com/photos/3785079/pexels-photo-3785079.jpeg?auto=compress&cs=tinysrgb&w=400",
    social: { linkedin: "#", twitter: "#" }
  },
  {
    name: "Dr. Priya Patel",
    role: "Chief Medical Officer",
    bio: "Regulatory affairs expert with deep knowledge of pharmaceutical compliance and patient safety.",
    image: "https://images.pexels.com/photos/3760067/pexels-photo-3760067.jpeg?auto=compress&cs=tinysrgb&w=400",
    social: { linkedin: "#", twitter: "#" }
  },
  {
    name: "James Thompson",
    role: "Head of Engineering",
    bio: "Full-stack engineer specializing in blockchain applications and enterprise software architecture.",
    image: "https://images.pexels.com/photos/3777943/pexels-photo-3777943.jpeg?auto=compress&cs=tinysrgb&w=400",
    social: { linkedin: "#", twitter: "#" }
  }
];

const stats = [
  { value: "50M+", label: "Batches Tracked", icon: CheckCircle },
  { value: "500+", label: "Companies Trust Us", icon: Users },
  { value: "99.9%", label: "Uptime Guarantee", icon: Shield },
  { value: "50+", label: "Countries Served", icon: Globe }
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 border-blue-200">
              About PharmaTrace
            </Badge>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Securing Global Health
              </span>
              <br />
              <span className="text-gray-900 dark:text-white">
                Through Innovation
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
              We're on a mission to eliminate counterfeit drugs and ensure pharmaceutical integrity 
              through blockchain technology, protecting patients worldwide.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Link href="/dashboard">
                  Get Started <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/docs">
                  Learn More
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <stat.icon className="h-8 w-8 text-blue-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{stat.value}</div>
                <div className="text-gray-600 dark:text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-24 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-6">
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Our Mission
                </span>
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                To create a world where every pharmaceutical product can be instantly verified, 
                ensuring patient safety and eliminating counterfeit drugs from the global supply chain.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  The Problem We're Solving
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mt-1">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">$200B+ Annual Loss</div>
                      <div className="text-gray-600 dark:text-gray-400 text-sm">Global pharmaceutical industry losses to counterfeiting</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mt-1">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">1M+ Deaths Annually</div>
                      <div className="text-gray-600 dark:text-gray-400 text-sm">Caused by counterfeit and substandard medicines</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mt-1">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">Complex Supply Chains</div>
                      <div className="text-gray-600 dark:text-gray-400 text-sm">Lack of transparency and traceability</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Our Solution
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mt-1">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">Blockchain Verification</div>
                      <div className="text-gray-600 dark:text-gray-400 text-sm">Immutable records on Solana blockchain</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mt-1">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">Real-time Tracking</div>
                      <div className="text-gray-600 dark:text-gray-400 text-sm">End-to-end supply chain visibility</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mt-1">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">Instant Verification</div>
                      <div className="text-gray-600 dark:text-gray-400 text-sm">QR code scanning for immediate authenticity checks</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Our Values
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              The principles that guide everything we do at PharmaTrace
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-0 bg-white dark:bg-gray-900">
                <CardContent className="p-8">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${value.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-200`}>
                    <value.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{value.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      {/* <section className="py-24 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Meet Our Team
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Passionate experts dedicated to revolutionizing pharmaceutical security
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-0 overflow-hidden">
                <div className="aspect-square overflow-hidden">
                  <img 
                    src={member.image} 
                    alt={member.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{member.name}</h3>
                  <div className="text-blue-600 font-medium mb-3">{member.role}</div>
                  <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-4">{member.bio}</p>
                  <div className="flex gap-2">
                    <a href={member.social.linkedin} className="w-8 h-8 bg-gray-100 dark:bg-gray-800 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-lg flex items-center justify-center transition-colors">
                      <Linkedin className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    </a>
                    <a href={member.social.twitter} className="w-8 h-8 bg-gray-100 dark:bg-gray-800 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-lg flex items-center justify-center transition-colors">
                      <Twitter className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    </a>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div> 
      </section> */}

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Join Our Mission?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Help us build a safer pharmaceutical future. Whether you're a manufacturer, 
            distributor, or regulator, we have solutions for you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
              <Link href="/dashboard">
                Get Started Today <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
              <Link href="/support">
                Contact Sales
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}