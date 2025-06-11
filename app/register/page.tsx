"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useWalletContext } from "@/components/WalletProvider";
import { format } from "date-fns";
import { CalendarIcon, Package, Shield, Zap, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import QrGenerator from "@/components/QrGenerator";
import { registerBatchTransaction } from "@/services/blockchainService";
import { insertBatchMetadata } from "@/services/supabaseService";

const registerFormSchema = z.object({
  batchId: z.string().min(3, {
    message: "Batch ID must be at least 3 characters.",
  }),
  productName: z.string().min(2, {
    message: "Product name must be at least 2 characters.",
  }),
  mfgDate: z.date({
    required_error: "Manufacturing date is required.",
  }),
  expDate: z.date({
    required_error: "Expiry date is required.",
  }),
  ipfsHash: z.string().optional(),
});

type RegisterFormValues = z.infer<typeof registerFormSchema>;

export default function RegisterPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { connected, wallet, publicKey } = useWalletContext();
  
  const [submitting, setSubmitting] = useState(false);
  const [registeredBatch, setRegisteredBatch] = useState<{
    txSignature: string;
    batchId: string;
    productName: string;
    batchPDA: string;
  } | null>(null);
  
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      batchId: "",
      productName: "",
      mfgDate: new Date(),
      expDate: new Date(new Date().setMonth(new Date().getMonth() + 12)),
      ipfsHash: "",
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    if (!connected || !publicKey || !wallet) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to register a batch.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setSubmitting(true);
      
      const mfgDateStr = format(data.mfgDate, "yyyy-MM-dd");
      const expDateStr = format(data.expDate, "yyyy-MM-dd");
      
      const { txSignature, batchId, productName, batchPDA } = await registerBatchTransaction(
        wallet,
        data.batchId,
        data.productName,
        mfgDateStr,
        expDateStr
      );
      
      await insertBatchMetadata({
        batch_id: data.batchId,
        product_name: data.productName,
        manufacturer_wallet: publicKey,
        current_owner_wallet: publicKey,
        mfg_date: mfgDateStr,
        exp_date: expDateStr,
        status: 0,
        ipfs_hash: data.ipfsHash || null,
        batch_pda: batchPDA,
        init_tx_signature: txSignature,
      });
      
      setRegisteredBatch({ txSignature, batchId, productName, batchPDA });
      
      toast({
        title: "Batch registered successfully",
        description: "Your batch has been registered on the blockchain.",
      });
      
    } catch (error: any) {
      console.error("Error registering batch:", error);
      
      let errorTitle = "Registration failed";
      let errorDescription = "There was an error registering your batch. Please try again.";
      
      // Check for specific blockchain errors
      if (error?.message) {
        const errorMessage = error.message.toLowerCase();
        
        if (errorMessage.includes("insufficient sol")) {
          errorTitle = "Insufficient funds";
          errorDescription = "Your wallet doesn't have enough SOL to cover transaction fees. Please add SOL to your wallet and try again.";
        } else if (errorMessage.includes("user rejected")) {
          errorTitle = "Transaction cancelled";
          errorDescription = "You cancelled the transaction. Please try again when ready.";
        } else if (errorMessage.includes("blockhash not found")) {
          errorTitle = "Network error";
          errorDescription = "Network congestion detected. Please wait a moment and try again.";
        }
      }
      
      toast({
        title: errorTitle,
        description: errorDescription,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!connected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 py-8">
          <PageHeader
            heading="Register Batch"
            text="Register a new pharmaceutical batch on the blockchain"
          />
          
          <div className="max-w-md mx-auto mt-12">
            <Card className="border-2 border-dashed border-gray-300 dark:border-gray-600">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <div className="rounded-full bg-primary/10 p-6 mb-6">
                  <Package className="h-12 w-12 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Connect Wallet to Register</h3>
                <p className="text-muted-foreground mb-6 max-w-sm">
                  You need to connect your Solana wallet to register a new pharmaceutical batch on the blockchain.
                </p>
                <Button onClick={() => router.push("/dashboard")} size="lg">
                  Return to Dashboard
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <PageHeader
          heading="Register Batch"
          text="Register a new pharmaceutical batch on the blockchain"
        />
        
        {registeredBatch ? (
          <div className="max-w-4xl mx-auto mt-8">
            <Card className="border-2 border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-4">
                  <div className="rounded-full bg-green-100 dark:bg-green-900 p-4">
                    <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
                  </div>
                </div>
                <CardTitle className="text-2xl text-green-800 dark:text-green-200">
                  Batch Registered Successfully!
                </CardTitle>
                <p className="text-green-700 dark:text-green-300 mt-2">
                  Your pharmaceutical batch has been registered on the blockchain and is ready for tracking.
                </p>
              </CardHeader>
              
              <CardContent>
                <div className="grid gap-8 lg:grid-cols-2">
                  <div className="space-y-6">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border">
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Package className="h-5 w-5 text-primary" />
                        Batch Details
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Batch ID:</span>
                          <span className="font-mono font-medium">{registeredBatch.batchId}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Product:</span>
                          <span className="font-medium">{registeredBatch.productName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Transaction:</span>
                          <span className="font-mono text-sm">{registeredBatch.txSignature.substring(0, 8)}...</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Batch PDA:</span>
                          <span className="font-mono text-sm">{registeredBatch.batchPDA.substring(0, 8)}...</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border">
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Shield className="h-5 w-5 text-blue-500" />
                        Verification
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Use the QR code to verify the authenticity of this batch throughout the supply chain.
                        Anyone can scan this code to verify the batch on the blockchain.
                      </p>
                      <div className="flex gap-3">
                        <Button onClick={() => setRegisteredBatch(null)} variant="outline" size="sm">
                          Register Another Batch
                        </Button>
                        <Button 
                          onClick={() => router.push(`/verify?batchPDA=${registeredBatch.batchPDA}`)}
                          size="sm"
                        >
                          View Verification
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-center">
                    <QrGenerator 
                      batchPDA={registeredBatch.batchPDA}
                      batchId={registeredBatch.batchId}
                      medicineName={registeredBatch.productName}
                      size={280} 
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto mt-8">
            <div className="grid gap-8 lg:grid-cols-3">
              {/* Registration Form */}
              <div className="lg:col-span-2">
                <Card className="border-2 hover:border-primary/20 transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-6 w-6 text-primary" />
                      Batch Information
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Enter the details of the pharmaceutical batch to register on the blockchain
                    </p>
                  </CardHeader>
                  
                  <CardContent>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid gap-6 md:grid-cols-2">
                          <FormField
                            control={form.control}
                            name="batchId"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Batch ID</FormLabel>
                                <FormControl>
                                  <Input placeholder="BATCH123" {...field} className="font-mono" />
                                </FormControl>
                                <FormDescription>
                                  A unique identifier for this batch
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="productName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Product Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="Medication Name" {...field} />
                                </FormControl>
                                <FormDescription>
                                  The name of the pharmaceutical product
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <div className="grid gap-6 md:grid-cols-2">
                          <FormField
                            control={form.control}
                            name="mfgDate"
                            render={({ field }) => (
                              <FormItem className="flex flex-col">
                                <FormLabel>Manufacturing Date</FormLabel>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <FormControl>
                                      <Button
                                        variant="outline"
                                        className={cn(
                                          "pl-3 text-left font-normal",
                                          !field.value && "text-muted-foreground"
                                        )}
                                      >
                                        {field.value ? (
                                          format(field.value, "PPP")
                                        ) : (
                                          <span>Pick a date</span>
                                        )}
                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                      </Button>
                                    </FormControl>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                      mode="single"
                                      selected={field.value}
                                      onSelect={field.onChange}
                                      disabled={(date) =>
                                        date > new Date() || date < new Date("1900-01-01")
                                      }
                                      initialFocus
                                    />
                                  </PopoverContent>
                                </Popover>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="expDate"
                            render={({ field }) => (
                              <FormItem className="flex flex-col">
                                <FormLabel>Expiry Date</FormLabel>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <FormControl>
                                      <Button
                                        variant="outline"
                                        className={cn(
                                          "pl-3 text-left font-normal",
                                          !field.value && "text-muted-foreground"
                                        )}
                                      >
                                        {field.value ? (
                                          format(field.value, "PPP")
                                        ) : (
                                          <span>Pick a date</span>
                                        )}
                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                      </Button>
                                    </FormControl>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                      mode="single"
                                      selected={field.value}
                                      onSelect={field.onChange}
                                      disabled={(date) =>
                                        date < new Date() || date < new Date("1900-01-01")
                                      }
                                      initialFocus
                                    />
                                  </PopoverContent>
                                </Popover>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <FormField
                          control={form.control}
                          name="ipfsHash"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>IPFS Hash (Optional)</FormLabel>
                              <FormControl>
                                <Input placeholder="QmHashExample..." {...field} className="font-mono" />
                              </FormControl>
                              <FormDescription>
                                IPFS hash for additional metadata (optional)
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <Button 
                          type="submit" 
                          disabled={submitting}
                          size="lg"
                          className="w-full"
                        >
                          {submitting ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Registering on Blockchain...
                            </>
                          ) : (
                            <>
                              <Zap className="h-4 w-4 mr-2" />
                              Register Batch on Blockchain
                            </>
                          )}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </div>
              
              {/* Process Information */}
              <div>
                <Card className="sticky top-8">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-6 w-6 text-blue-500" />
                      Registration Process
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      How batch registration works
                    </p>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="space-y-4">
                      <div className="flex gap-4 p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 font-semibold text-sm">
                          1
                        </div>
                        <div>
                          <h4 className="font-medium mb-1 text-blue-900 dark:text-blue-100">Enter Batch Details</h4>
                          <p className="text-sm text-blue-700 dark:text-blue-300">
                            Provide the batch ID, product name, and dates.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex gap-4 p-4 rounded-lg bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-purple-600 dark:text-purple-400 font-semibold text-sm">
                          2
                        </div>
                        <div>
                          <h4 className="font-medium mb-1 text-purple-900 dark:text-purple-100">Blockchain Transaction</h4>
                          <p className="text-sm text-purple-700 dark:text-purple-300">
                            A transaction is sent to our verification account on Solana.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex gap-4 p-4 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center text-green-600 dark:text-green-400 font-semibold text-sm">
                          3
                        </div>
                        <div>
                          <h4 className="font-medium mb-1 text-green-900 dark:text-green-100">Generate QR Code</h4>
                          <p className="text-sm text-green-700 dark:text-green-300">
                            A unique QR code is created with the batch PDA and batch info.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex gap-4 p-4 rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center text-orange-600 dark:text-orange-400 font-semibold text-sm">
                          4
                        </div>
                        <div>
                          <h4 className="font-medium mb-1 text-orange-900 dark:text-orange-100">Track & Verify</h4>
                          <p className="text-sm text-orange-700 dark:text-orange-300">
                            Anyone can scan the QR code to verify authenticity on the blockchain.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                      <h4 className="font-medium mb-2 text-sm">💡 Registration Fee</h4>
                      <p className="text-xs text-muted-foreground">
                        A small fee of 0.001 SOL (~$0.10) is required to register each batch on the blockchain.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}