"use client";

import { useState, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useWalletContext } from "@/components/WalletProvider";
import { isValidPublicKey, truncatePublicKey } from "@/lib/solana";
import { getBatchesByOwner, updateBatchOwner } from "@/services/supabaseService";
import { transferBatchOnChain, isCurrentOwner } from "@/services/blockchainService";
import { insertBatchTransfer } from "@/services/supabaseService";
import { Batch } from "@/types";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowRight, 
  Check, 
  CircleAlert, 
  Wallet, 
  ArrowRightLeft, 
  Package 
} from "lucide-react";
import { formatDate } from "@/services/qrService";

// Form validation schema
const transferFormSchema = z.object({
  batchPDA: z.string().min(1, {
    message: "Please select a batch to transfer",
  }),
  newOwnerWallet: z.string().refine(isValidPublicKey, {
    message: "Please enter a valid Solana wallet address",
  }),
});

type TransferFormValues = z.infer<typeof transferFormSchema>;

export default function TransferPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { connected, publicKey, wallet } = useWalletContext();
  
  const [submitting, setSubmitting] = useState(false);
  const [ownedBatches, setOwnedBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [transferComplete, setTransferComplete] = useState(false);
  
  const form = useForm<TransferFormValues>({
    resolver: zodResolver(transferFormSchema),
    defaultValues: {
      batchPDA: "",
      newOwnerWallet: "",
    },
  });

  // Fetch owned batches when wallet is connected
  useEffect(() => {
    const fetchOwnedBatches = async () => {
      if (!connected || !publicKey) {
        setOwnedBatches([]);
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const batches = await getBatchesByOwner(publicKey);
        setOwnedBatches(batches || []);
      } catch (error) {
        console.error("Error fetching owned batches:", error);
        toast({
          title: "Error",
          description: "Failed to fetch your owned batches.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchOwnedBatches();
  }, [connected, publicKey, toast]);

  // Update selected batch when batchPDA changes
  const onBatchChange = (batchPDA: string) => {
    const batch = ownedBatches.find(b => b.batch_pda === batchPDA) || null;
    setSelectedBatch(batch);
  };

  const onSubmit = async (data: TransferFormValues) => {
    if (!connected || !publicKey || !wallet) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to transfer a batch.",
        variant: "destructive",
      });
      return;
    }
    
    if (!selectedBatch) {
      toast({
        title: "No batch selected",
        description: "Please select a valid batch to transfer.",
        variant: "destructive",
      });
      return;
    }
    
    // Verify the user is the current owner
    const isOwner = selectedBatch.current_owner_wallet === publicKey;
    if (!isOwner) {
      toast({
        title: "Ownership verification failed",
        description: "You are not the current owner of this batch.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setSubmitting(true);
      
      // Transfer batch on blockchain
      const txSignature = await transferBatchOnChain(
        wallet,
        data.batchPDA,
        data.newOwnerWallet
      );
      
      // Record transfer in database
      await insertBatchTransfer({
        batch_id: selectedBatch.batch_id,
        from_wallet: publicKey,
        to_wallet: data.newOwnerWallet,
        tx_signature: txSignature,
      });
      
      // Update batch owner in database
      await updateBatchOwner(selectedBatch.batch_id, data.newOwnerWallet);
      
      // Mark transfer as complete
      setTransferComplete(true);
      
      toast({
        title: "Transfer successful",
        description: "The batch has been transferred to the new owner.",
      });
      
    } catch (error) {
      console.error("Error transferring batch:", error);
      toast({
        title: "Transfer failed",
        description: "There was an error transferring the batch. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // If wallet not connected, show message
  if (!connected) {
    return (
      <div className="space-y-6">
        <PageHeader
          heading="Transfer Batch"
          text="Transfer ownership of a pharmaceutical batch to another wallet"
        />
        
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-primary/10 p-6 mb-4">
            <Wallet className="h-10 w-10 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Connect Wallet to Transfer</h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            You need to connect your Solana wallet to transfer a batch to a new owner.
          </p>
          <Button onClick={() => router.push("/dashboard")}>Return to Dashboard</Button>
        </div>
      </div>
    );
  }

  // If transfer is complete, show success screen
  if (transferComplete) {
    return (
      <div className="space-y-6">
        <PageHeader
          heading="Transfer Complete"
          text="The batch has been successfully transferred to the new owner"
        />
        
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <div className="flex flex-col items-center text-center">
              <div className="rounded-full bg-green-100 dark:bg-green-900 p-3 mb-4">
                <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-xl">Transfer Successful</CardTitle>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {selectedBatch && (
              <div className="bg-muted/50 rounded-lg p-4">
                <h3 className="font-medium mb-2">{selectedBatch.product_name}</h3>
                <div className="grid grid-cols-2 gap-y-2 text-sm">
                  <div className="text-muted-foreground">Batch ID:</div>
                  <div className="font-mono">{selectedBatch.batch_id}</div>
                  
                  <div className="text-muted-foreground">From:</div>
                  <div className="font-mono">{truncatePublicKey(publicKey || '')}</div>
                  
                  <div className="text-muted-foreground">To:</div>
                  <div className="font-mono">{truncatePublicKey(form.getValues().newOwnerWallet)}</div>
                </div>
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="outline" onClick={() => {
                form.reset();
                setTransferComplete(false);
              }}>
                Transfer Another Batch
              </Button>
              
              <Button asChild>
                <a
                  href={`/verify?batchPDA=${form.getValues().batchPDA}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Batch Details
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show transfer form
  return (
    <div className="space-y-6">
      <PageHeader
        heading="Transfer Batch"
        text="Transfer ownership of a pharmaceutical batch to another wallet"
      />
      
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Transfer Ownership</CardTitle>
            </CardHeader>
            
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : ownedBatches.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-30" />
                  <p className="text-muted-foreground mb-2">You don't own any batches</p>
                  <Button asChild>
                    <a href="/register">Register a New Batch</a>
                  </Button>
                </div>
              ) : (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="batchPDA"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Select Batch</FormLabel>
                          <Select 
                            onValueChange={(value) => {
                              field.onChange(value);
                              onBatchChange(value);
                            }}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a batch to transfer" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {ownedBatches.map((batch) => (
                                <SelectItem key={batch.batch_pda} value={batch.batch_pda}>
                                  {batch.product_name} ({batch.batch_id})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Select a batch that you own to transfer
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="newOwnerWallet"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>New Owner Wallet</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter Solana public key" 
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            The Solana wallet address of the new owner
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      disabled={submitting || !selectedBatch}
                      className="w-full"
                    >
                      {submitting ? "Transferring..." : "Transfer Batch"}
                    </Button>
                  </form>
                </Form>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Transfer Preview</CardTitle>
            </CardHeader>
            
            <CardContent>
              {selectedBatch ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-medium">{selectedBatch.product_name}</h3>
                    <div className="text-sm text-muted-foreground">
                      Batch ID: <span className="font-mono">{selectedBatch.batch_id}</span>
                    </div>
                  </div>
                  
                  <div className="rounded-lg border p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-sm text-muted-foreground">
                        <span>Manufacturing Date:</span>
                        <span className="block font-medium text-foreground">
                          {formatDate(selectedBatch.mfg_date)}
                        </span>
                      </div>
                      
                      <div className="text-sm text-muted-foreground">
                        <span>Expiry Date:</span>
                        <span className="block font-medium text-foreground">
                          {formatDate(selectedBatch.exp_date)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="font-mono text-xs truncate max-w-[40%]">
                        {truncatePublicKey(selectedBatch.current_owner_wallet)}
                      </div>
                      
                      <ArrowRight className="h-4 w-4 mx-2 flex-shrink-0 text-muted-foreground" />
                      
                      <div className="font-mono text-xs truncate max-w-[40%]">
                        {form.watch("newOwnerWallet") 
                          ? truncatePublicKey(form.watch("newOwnerWallet"))
                          : "New owner wallet"}
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium mb-2">Transfer Information</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      This transfer will be recorded on the Solana blockchain and in the
                      off-chain database for fast verification.
                    </p>
                    
                    <div className="text-sm flex items-start gap-2">
                      <CircleAlert className="h-4 w-4 mt-0.5 text-amber-500" />
                      <div>
                        Once transferred, you will no longer have control over this batch.
                        This action cannot be undone.
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center">
                  <ArrowRightLeft className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-30" />
                  <p className="text-muted-foreground">
                    Select a batch to see transfer details
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}