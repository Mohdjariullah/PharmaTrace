"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import dynamic from "next/dynamic";
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
import { CalendarIcon, Package, Shield, Zap, CheckCircle, AlertTriangle, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { registerBatchTransaction } from "@/services/blockchainService";
import { insertBatchMetadata, insertQrCode, getBatchById } from "@/services/supabaseService";

const QrGenerator = dynamic(() => import("@/components/QrGenerator"), {
  ssr: false,
  loading: () => <div className="w-[280px] h-[280px] bg-gray-100 animate-pulse rounded-lg"></div>
});

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
    ownerAddress: string;
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
      
      // First check if batch already exists
      const existingBatch = await getBatchById(data.batchId);
      if (existingBatch) {
        toast({
          title: "Batch already exists",
          description: `A batch with ID "${data.batchId}" already exists. Please use a different batch ID.`,
          variant: "destructive",
        });
        return;
      }
      
      const mfgDateStr = format(data.mfgDate, "yyyy-MM-dd");
      const expDateStr = format(data.expDate, "yyyy-MM-dd");
      
      // Register on blockchain first
      const { txSignature, batchId, productName, batchPDA } = await registerBatchTransaction(
        wallet,
        data.batchId,
        data.productName,
        mfgDateStr,
        expDateStr
      );
      
      // Insert batch metadata
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
      
      // Insert QR code data
      await insertQrCode({
        tx_signature: txSignature,
        batch_id: data.batchId,
        medicine_name: data.productName,
        owner_address: publicKey,
      });
      
      setRegisteredBatch({ 
        txSignature, 
        batchId, 
        productName, 
        batchPDA,
        ownerAddress: publicKey 
      });
      
      toast({
        title: "Batch registered successfully",
        description: "Your batch has been registered on the blockchain.",
      });
      
    } catch (error: any) {
      console.error("Error registering batch:", error);
      
      let errorTitle = "Registration failed";
      let errorDescription = "There was an error registering your batch. Please try again.";
      
      // Check for specific errors
      if (error?.message) {
        const errorMessage = error.message.toLowerCase();
        
        if (errorMessage.includes("already exists")) {
          errorTitle = "Batch already exists";
          errorDescription = error.message;
        } else if (errorMessage.includes("insufficient sol")) {
          errorTitle = "Insufficient funds";
          errorDescription = "Your wallet doesn't have enough SOL to cover transaction fees. Please add SOL to your wallet and try again.";
        } else if (errorMessage.includes("user rejected")) {
          errorTitle = "Transaction cancelled";
          errorDescription = "You cancelled the transaction. Please try again when ready.";
        } else if (errorMessage.includes("blockhash not found")) {
          errorTitle = "Network error";
          errorDescription = "Network congestion detected. Please wait a moment and try again.";
        } else if (errorMessage.includes("duplicate key")) {
          errorTitle = "Batch ID already exists";
          errorDescription = "This batch ID is already registered. Please use a different batch ID.";
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
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Register New Batch
          </h1>
          <p className="text-xl text-muted-foreground">
            Register pharmaceutical batches on the blockchain
          </p>
        </div>
        
        <div className="max-w-md mx-auto">
          <Card className="border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/10 dark:to-purple-900/10">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center mb-6">
                <Package className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Connect Wallet to Register</h3>
              <p className="text-muted-foreground mb-6 max-w-sm">
                You need to connect your Solana wallet to register a new pharmaceutical batch on the blockchain.
              </p>
              <Button onClick={() => router.push("/dashboard")} size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600">
                Return to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
          Register New Batch
        </h1>
        <p className="text-xl text-muted-foreground">
          Create an immutable record of your pharmaceutical batch on the blockchain
        </p>
      </div>
      
      {registeredBatch ? (
        <div className="max-w-4xl mx-auto">
          <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 shadow-xl">
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-green-600 to-emerald-600 flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-white" />
                </div>
              </div>
              <CardTitle className="text-3xl text-green-800 dark:text-green-200">
                Batch Registered Successfully!
              </CardTitle>
              <p className="text-green-700 dark:text-green-300 mt-2 text-lg">
                Your pharmaceutical batch has been registered on the blockchain and is ready for tracking.
              </p>
            </CardHeader>
            
            <CardContent>
              <div className="grid gap-8 lg:grid-cols-2">
                <div className="space-y-6">
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border shadow-sm">
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
                        <span className="text-muted-foreground">Owner:</span>
                        <span className="font-mono text-sm">{registeredBatch.ownerAddress.substring(0, 8)}...</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border shadow-sm">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Shield className="h-5 w-5 text-blue-500" />
                      Verification
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Use the QR code to verify the authenticity of this batch throughout the supply chain.
                      Anyone can scan this code to verify the transaction on the blockchain.
                    </p>
                    <div className="flex gap-3">
                      <Button onClick={() => setRegisteredBatch(null)} variant="outline" size="sm">
                        Register Another Batch
                      </Button>
                      <Button 
                        onClick={() => router.push(`/verify?txSignature=${registeredBatch.txSignature}`)}
                        size="sm"
                        className="bg-gradient-to-r from-blue-600 to-purple-600"
                      >
                        View Verification
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-center">
                  <QrGenerator 
                    txSignature={registeredBatch.txSignature}
                    batchId={registeredBatch.batchId}
                    medicineName={registeredBatch.productName}
                    ownerAddress={registeredBatch.ownerAddress}
                    size={280} 
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="max-w-6xl mx-auto">
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Registration Form */}
            <div className="lg:col-span-2">
              <Card className="border-0 shadow-xl bg-white dark:bg-gray-900">
                <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Sparkles className="h-6 w-6" />
                    Batch Information
                  </CardTitle>
                  <p className="text-blue-100">
                    Enter the details of the pharmaceutical batch to register on the blockchain
                  </p>
                </CardHeader>
                
                <CardContent className="p-8">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <div className="grid gap-6 md:grid-cols-2">
                        <FormField
                          control={form.control}
                          name="batchId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-base font-semibold">Batch ID</FormLabel>
                              <FormControl>
                                <Input placeholder="BATCH123" {...field} className="font-mono h-12" />
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
                              <FormLabel className="text-base font-semibold">Product Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Medication Name" {...field} className="h-12" />
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
                              <FormLabel className="text-base font-semibold">Manufacturing Date</FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant="outline"
                                      className={cn(
                                        "pl-3 text-left font-normal h-12",
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
                              <FormLabel className="text-base font-semibold">Expiry Date</FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant="outline"
                                      className={cn(
                                        "pl-3 text-left font-normal h-12",
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
                            <FormLabel className="text-base font-semibold">IPFS Hash (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="QmHashExample..." {...field} className="font-mono h-12" />
                            </FormControl>
                            <FormDescription>
                              IPFS hash for additional metadata (optional)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl p-6">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <h4 className="font-medium text-amber-800 dark:text-amber-200 mb-1">
                              Important: Batch ID Must Be Unique
                            </h4>
                            <p className="text-sm text-amber-700 dark:text-amber-300">
                              Each batch ID can only be registered once. If you see an error about duplicate batch ID, 
                              please choose a different identifier.
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <Button 
                        type="submit" 
                        disabled={submitting}
                        size="lg"
                        className="w-full h-14 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      >
                        {submitting ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                            Registering on Blockchain...
                          </>
                        ) : (
                          <>
                            <Zap className="h-5 w-5 mr-3" />
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
              <Card className="sticky top-8 border-0 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-t-lg">
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-6 w-6" />
                    Registration Process
                  </CardTitle>
                  <p className="text-green-100">
                    How batch registration works
                  </p>
                </CardHeader>
                
                <CardContent className="p-6 space-y-6">
                  <div className="space-y-4">
                    <div className="flex gap-4 p-4 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
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
                    
                    <div className="flex gap-4 p-4 rounded-xl bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800">
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
                    
                    <div className="flex gap-4 p-4 rounded-xl bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center text-green-600 dark:text-green-400 font-semibold text-sm">
                        3
                      </div>
                      <div>
                        <h4 className="font-medium mb-1 text-green-900 dark:text-green-100">Generate QR Code</h4>
                        <p className="text-sm text-green-700 dark:text-green-300">
                          A unique QR code is created with the transaction hash and batch info.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-4 p-4 rounded-xl bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center text-orange-600 dark:text-orange-400 font-semibold text-sm">
                        4
                      </div>
                      <div>
                        <h4 className="font-medium mb-1 text-orange-900 dark:text-orange-100">Track & Verify</h4>
                        <p className="text-sm text-orange-700 dark:text-orange-300">
                          Anyone can scan the QR code to verify the transaction on the blockchain.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
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
  );
}