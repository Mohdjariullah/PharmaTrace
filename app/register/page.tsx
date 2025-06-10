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
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useWalletContext } from "@/components/WalletProvider";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import QrGenerator from "@/components/QrGenerator";
import { initBatchOnChain } from "@/services/blockchainService";
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
  const [registeredBatchPDA, setRegisteredBatchPDA] = useState<string | null>(null);
  
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
      
      const { batchPDA, txSignature } = await initBatchOnChain(
        wallet,
        data.batchId,
        data.productName,
        mfgDateStr,
        expDateStr,
        data.ipfsHash || ""
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
      
      setRegisteredBatchPDA(batchPDA);
      
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
        
        if (errorMessage.includes("simulation failed") || 
            errorMessage.includes("attempt to debit an account but found no record of a prior credit")) {
          errorTitle = "Insufficient funds";
          errorDescription = "Your wallet doesn't have enough SOL to cover transaction fees and rent exemption. Please add SOL to your wallet and try again.";
        } else if (errorMessage.includes("user rejected")) {
          errorTitle = "Transaction cancelled";
          errorDescription = "You cancelled the transaction. Please try again when ready.";
        } else if (errorMessage.includes("blockhash not found")) {
          errorTitle = "Network error";
          errorDescription = "Network congestion detected. Please wait a moment and try again.";
        } else if (errorMessage.includes("program error")) {
          errorTitle = "Smart contract error";
          errorDescription = "There was an issue with the smart contract. Please check your inputs and try again.";
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
      <div className="space-y-6">
        <PageHeader
          heading="Register Batch"
          text="Register a new pharmaceutical batch on the blockchain"
        />
        
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-primary/10 p-6 mb-4">
            <svg
              className="h-10 w-10 text-primary"
              fill="none"
              height="24"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              width="24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M15 5v14" />
              <path d="M5 12h14" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-2">Connect Wallet to Register</h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            You need to connect your Solana wallet to register a new pharmaceutical batch.
          </p>
          <Button onClick={() => router.push("/dashboard")}>Return to Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        heading="Register Batch"
        text="Register a new pharmaceutical batch on the blockchain"
      />
      
      {registeredBatchPDA ? (
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <h2 className="text-xl font-semibold mb-4">Batch Registered Successfully!</h2>
            <p className="text-muted-foreground mb-6">
              Your pharmaceutical batch has been registered on the blockchain and is ready for tracking.
              Use the QR code to verify the authenticity of this batch throughout the supply chain.
            </p>
            
            <div className="space-y-4">
              <Button onClick={() => setRegisteredBatchPDA(null)} variant="outline">
                Register Another Batch
              </Button>
              <Button 
                onClick={() => router.push(`/verify?batchPDA=${registeredBatchPDA}`)}
                className="ml-2"
              >
                View Batch Details
              </Button>
            </div>
          </div>
          
          <div>
            <QrGenerator batchPDA={registeredBatchPDA} size={240} />
          </div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium">Batch Information</h3>
              <p className="text-sm text-muted-foreground">
                Enter the details of the pharmaceutical batch to register
              </p>
            </div>
            
            <Separator />
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="batchId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Batch ID</FormLabel>
                      <FormControl>
                        <Input placeholder="BATCH123" {...field} />
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
                
                <div className="grid gap-4 grid-cols-2">
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
                        <Input placeholder="QmHashExample..." {...field} />
                      </FormControl>
                      <FormDescription>
                        IPFS hash for additional metadata (optional)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Registering..." : "Register Batch"}
                </Button>
              </form>
            </Form>
          </div>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium">Registration Process</h3>
              <p className="text-sm text-muted-foreground">
                How batch registration works
              </p>
            </div>
            
            <Separator />
            
            <div className="space-y-4">
              <div className="rounded-lg border p-4">
                <h4 className="font-medium mb-2">1. Enter Batch Details</h4>
                <p className="text-sm text-muted-foreground">
                  Provide the batch ID, product name, manufacturing date, and expiry date.
                </p>
              </div>
              
              <div className="rounded-lg border p-4">
                <h4 className="font-medium mb-2">2. On-Chain Registration</h4>
                <p className="text-sm text-muted-foreground">
                  The batch information is stored immutably on the Solana blockchain,
                  creating a tamper-proof record.
                </p>
              </div>
              
              <div className="rounded-lg border p-4">
                <h4 className="font-medium mb-2">3. Generate QR Code</h4>
                <p className="text-sm text-muted-foreground">
                  A unique QR code is generated that can be used to verify the authenticity
                  of the batch throughout the supply chain.
                </p>
              </div>
              
              <div className="rounded-lg border p-4">
                <h4 className="font-medium mb-2">4. Track and Transfer</h4>
                <p className="text-sm text-muted-foreground">
                  The batch can now be tracked through the supply chain and
                  transferred to new owners as it moves downstream.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}