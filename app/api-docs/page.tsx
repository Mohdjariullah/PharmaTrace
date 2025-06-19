"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Code, 
  Download, 
  ExternalLink, 
  Copy,
  CheckCircle,
  AlertCircle,
  Info,
  Zap,
  Shield,
  Key,
  Globe
} from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const endpoints = [
  {
    method: "POST",
    path: "/api/v1/batches",
    title: "Register Batch",
    description: "Register a new pharmaceutical batch on the blockchain",
    auth: "Required",
    rateLimit: "100/hour",
    request: {
      batchId: "string (required) - Unique batch identifier",
      productName: "string (required) - Product name",
      mfgDate: "string (required) - Manufacturing date (YYYY-MM-DD)",
      expDate: "string (required) - Expiry date (YYYY-MM-DD)",
      ipfsHash: "string (optional) - IPFS hash for additional metadata"
    },
    response: {
      success: true,
      data: {
        txSignature: "string - Blockchain transaction signature",
        batchId: "string - Batch identifier",
        batchPDA: "string - Program derived address",
        qrCode: "string - Base64 encoded QR code"
      }
    }
  },
  {
    method: "GET",
    path: "/api/v1/batches/{batchId}",
    title: "Get Batch Details",
    description: "Retrieve detailed information about a specific batch",
    auth: "Optional",
    rateLimit: "1000/hour",
    request: {
      batchId: "string (path) - Batch identifier"
    },
    response: {
      success: true,
      data: {
        batchId: "string",
        productName: "string",
        manufacturer: "string",
        currentOwner: "string",
        mfgDate: "string",
        expDate: "string",
        status: "number",
        createdAt: "string",
        transfers: "array"
      }
    }
  },
  {
    method: "POST",
    path: "/api/v1/verify",
    title: "Verify Batch",
    description: "Verify batch authenticity using transaction signature",
    auth: "Optional",
    rateLimit: "500/hour",
    request: {
      txSignature: "string (required) - Blockchain transaction signature"
    },
    response: {
      success: true,
      data: {
        isValid: "boolean",
        batch: "object",
        verification: "object"
      }
    }
  },
  {
    method: "POST",
    path: "/api/v1/transfer",
    title: "Transfer Ownership",
    description: "Transfer batch ownership to a new wallet",
    auth: "Required",
    rateLimit: "50/hour",
    request: {
      batchPDA: "string (required) - Batch program derived address",
      newOwner: "string (required) - New owner wallet address"
    },
    response: {
      success: true,
      data: {
        txSignature: "string",
        fromOwner: "string",
        toOwner: "string"
      }
    }
  }
];

const sdks = [
  {
    language: "JavaScript",
    package: "@pharmatrace/sdk",
    version: "1.2.0",
    install: "npm install @pharmatrace/sdk",
    example: `import { PharmaTrace } from '@pharmatrace/sdk';

const client = new PharmaTrace({
  apiKey: 'your-api-key',
  environment: 'production' // or 'sandbox'
});

// Register a batch
const batch = await client.registerBatch({
  batchId: 'BATCH123',
  productName: 'Medicine Name',
  mfgDate: '2024-01-01',
  expDate: '2025-01-01'
});

console.log('Batch registered:', batch.txSignature);`
  },
  {
    language: "Python",
    package: "pharmatrace-python",
    version: "1.1.0",
    install: "pip install pharmatrace",
    example: `from pharmatrace import PharmaTrace

client = PharmaTrace(
    api_key='your-api-key',
    environment='production'
)

# Register a batch
batch = client.register_batch(
    batch_id='BATCH123',
    product_name='Medicine Name',
    mfg_date='2024-01-01',
    exp_date='2025-01-01'
)

print(f"Batch registered: {batch['txSignature']}")`
  },
  {
    language: "cURL",
    package: "REST API",
    version: "v1",
    install: "No installation required",
    example: `curl -X POST https://api.pharmatrace.com/v1/batches \\
  -H "Authorization: Bearer your-api-key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "batchId": "BATCH123",
    "productName": "Medicine Name",
    "mfgDate": "2024-01-01",
    "expDate": "2025-01-01"
  }'`
  }
];

const errorCodes = [
  { code: 400, name: "Bad Request", description: "Invalid request parameters" },
  { code: 401, name: "Unauthorized", description: "Invalid or missing API key" },
  { code: 403, name: "Forbidden", description: "Insufficient permissions" },
  { code: 404, name: "Not Found", description: "Batch or resource not found" },
  { code: 409, name: "Conflict", description: "Batch ID already exists" },
  { code: 429, name: "Rate Limited", description: "Too many requests" },
  { code: 500, name: "Server Error", description: "Internal server error" }
];

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 border-blue-200">
              API Reference
            </Badge>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                PharmaTrace API
              </span>
              <br />
              <span className="text-gray-900 dark:text-white">
                Documentation
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
              Comprehensive API reference for integrating pharmaceutical tracking 
              and verification into your applications.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Download className="mr-2 h-5 w-5" />
                Download OpenAPI Spec
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="#quickstart">
                  Quick Start Guide
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* API Overview */}
      <section className="py-24 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-6">
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  API Overview
                </span>
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-16">
              <Card className="border-0 shadow-lg text-center">
                <CardContent className="p-6">
                  <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-xl flex items-center justify-center">
                    <Globe className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Base URL</h3>
                  <code className="text-sm bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded">
                    https://api.pharmatrace.com
                  </code>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg text-center">
                <CardContent className="p-6">
                  <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900 rounded-xl flex items-center justify-center">
                    <Shield className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Authentication</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Bearer Token</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg text-center">
                <CardContent className="p-6">
                  <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 rounded-xl flex items-center justify-center">
                    <Zap className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Rate Limits</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">1000 req/hour</p>
                </CardContent>
              </Card>
            </div>

            {/* Authentication */}
            <Card className="border-0 shadow-lg mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5 text-blue-600" />
                  Authentication
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  All API requests require authentication using a Bearer token in the Authorization header.
                </p>
                <div className="bg-gray-900 rounded-lg p-4">
                  <code className="text-green-400 text-sm">
                    {`Authorization: Bearer your-api-key-here`}
                  </code>
                </div>
                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-start gap-2">
                    <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        <strong>Get your API key:</strong> Sign up for a PharmaTrace account and generate 
                        your API key from the dashboard settings.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* API Endpoints */}
      <section className="py-24 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-6">
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  API Endpoints
                </span>
              </h2>
            </div>

            <div className="space-y-8">
              {endpoints.map((endpoint, index) => (
                <Card key={index} className="border-0 shadow-lg">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge 
                          className={`font-mono ${
                            endpoint.method === 'GET' ? 'bg-green-100 text-green-700' : 
                            endpoint.method === 'POST' ? 'bg-blue-100 text-blue-700' : 
                            'bg-orange-100 text-orange-700'
                          }`}
                        >
                          {endpoint.method}
                        </Badge>
                        <code className="text-lg font-mono text-gray-900 dark:text-white">
                          {endpoint.path}
                        </code>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="outline">{endpoint.auth}</Badge>
                        <Badge variant="secondary">{endpoint.rateLimit}</Badge>
                      </div>
                    </div>
                    <CardTitle className="text-xl">{endpoint.title}</CardTitle>
                    <p className="text-gray-600 dark:text-gray-300">{endpoint.description}</p>
                  </CardHeader>
                  
                  <CardContent>
                    <Tabs defaultValue="request">
                      <TabsList className="mb-4">
                        <TabsTrigger value="request">Request</TabsTrigger>
                        <TabsTrigger value="response">Response</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="request">
                        <div className="bg-gray-900 rounded-lg p-4">
                          <pre className="text-green-400 text-sm overflow-x-auto">
                            {JSON.stringify(endpoint.request, null, 2)}
                          </pre>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="response">
                        <div className="bg-gray-900 rounded-lg p-4">
                          <pre className="text-green-400 text-sm overflow-x-auto">
                            {JSON.stringify(endpoint.response, null, 2)}
                          </pre>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SDKs & Code Examples */}
      <section id="quickstart" className="py-24 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-6">
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  SDKs & Examples
                </span>
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                Get started quickly with our official SDKs and code examples
              </p>
            </div>

            <Tabs defaultValue="javascript" className="space-y-8">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                <TabsTrigger value="python">Python</TabsTrigger>
                <TabsTrigger value="curl">cURL</TabsTrigger>
              </TabsList>

              {sdks.map((sdk, index) => (
                <TabsContent key={index} value={sdk.language.toLowerCase()}>
                  <Card className="border-0 shadow-lg">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <Code className="h-5 w-5 text-blue-600" />
                          {sdk.language} SDK
                        </CardTitle>
                        <Badge variant="secondary">v{sdk.version}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Installation</h4>
                          <div className="bg-gray-900 rounded-lg p-4 flex items-center justify-between">
                            <code className="text-green-400 text-sm">{sdk.install}</code>
                            <Button variant="ghost" size="sm">
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Example Usage</h4>
                          <div className="bg-gray-900 rounded-lg p-4">
                            <pre className="text-green-400 text-sm overflow-x-auto">
                              {sdk.example}
                            </pre>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </div>
      </section>

      {/* Error Codes */}
      <section className="py-24 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-6">
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Error Codes
                </span>
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                Understanding API error responses
              </p>
            </div>

            <div className="grid gap-4">
              {errorCodes.map((error, index) => (
                <Card key={index} className="border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        error.code < 400 ? 'bg-green-100 dark:bg-green-900' :
                        error.code < 500 ? 'bg-yellow-100 dark:bg-yellow-900' :
                        'bg-red-100 dark:bg-red-900'
                      }`}>
                        <span className={`font-bold ${
                          error.code < 400 ? 'text-green-600' :
                          error.code < 500 ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {error.code}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{error.name}</h3>
                        <p className="text-gray-600 dark:text-gray-300">{error.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Resources */}
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
            <Card className="group hover:shadow-xl transition-all duration-300 border-0 text-center">
              <CardContent className="p-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <Download className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Postman Collection</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Import our Postman collection to test API endpoints
                </p>
                <Button variant="outline">
                  Download Collection <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 border-0 text-center">
              <CardContent className="p-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <Code className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Code Samples</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Browse complete code examples and tutorials
                </p>
                <Button asChild variant="outline">
                  <Link href="/docs">
                    View Examples <ExternalLink className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 border-0 text-center">
              <CardContent className="p-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <CheckCircle className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">API Status</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Monitor API uptime and performance metrics
                </p>
                <Button variant="outline">
                  Check Status <ExternalLink className="ml-2 h-4 w-4" />
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