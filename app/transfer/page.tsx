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
  Package,
  Shield,
  Zap,
  CheckCircle,
  Users,
  Send
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
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 py-8">
          <PageHeader
            heading="Transfer Batch"
            text="Transfer ownership of a pharmaceutical batch to another wallet"
          />
          
          <div className="max-w-md mx-auto mt-12">
            <Card className="border-2 border-dashed border-gray-300 dark:border-gray-600">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <div className="rounded-full bg-purple-100 dark:bg-purple-900 p-6 mb-6">
                  <Wallet className="h-12 w-12 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Connect Wallet to Transfer</h3>
                <p className="text-muted-foreground mb-6 max-w-sm">
                  You need to connect your Solana wallet to transfer a batch to a new owner.
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

  // If transfer is complete, show success screen
  if (transferComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 py-8">
          <PageHeader
            heading="Transfer Complete"
            text="The batch has been successfully transferred to the new owner"
          />
          
          <div className="max-w-3xl mx-auto mt-8">
            <Card className="border-2 border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-4">
                  <div className="rounded-full bg-green-100 dark:bg-green-900 p-4">
                    <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
                  </div>
                </div>
                <CardTitle className="text-2xl text-green-800 dark:text-green-200">
                  Transfer Successful!
                </CardTitle>
                <p className="text-green-700 dark:text-green-300 mt-2">
                  The batch ownership has been transferred on the blockchain.
                </p>
              </CardHeader>
              
              <CardContent>
                {selectedBatch && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border mb-6">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <Package className="h-5 w-5 text-primary" />
                      Transfer Details
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Product:</span>
                        <span className="font-medium">{selectedBatch.product_name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Batch ID:</span>
                        <span className="font-mono font-medium">{selectedBatch.batch_id}</span>
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div className="text-center">
                          <div className="text-xs text-muted-foreground mb-1">From</div>
                          <div className="font-mono text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                            {truncatePublicKey(publicKey || '')}
                          </div>
                        </div>
                        
                        <ArrowRight className="h-5 w-5 mx-4 text-muted-foreground" />
                        
                        <div className="text-center">
                          <div className="text-xs text-muted-foreground mb-1">To</div>
                          <div className="font-mono text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                            {truncatePublicKey(form.getValues().newOwnerWallet)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button variant="outline" onClick={() => {
                    form.reset();
                    setTransferComplete(false);
                    setSelectedBatch(null);
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
        </div>
      </div>
    );
  }

  // Show transfer form
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <PageHeader
          heading="Transfer Batch"
          text="Transfer ownership of a pharmaceutical batch to another wallet"
        />
        
        <div className="max-w-6xl mx-auto mt-8">
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Transfer Form */}
            <div className="lg:col-span-2">
              <Card className="border-2 hover:border-primary/20 transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ArrowRightLeft className="h-6 w-6 text-primary" />
                    Transfer Ownership
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Select a batch you own and specify the new owner's wallet address
                  </p>
                </CardHeader>
                
                <CardContent>
                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : ownedBatches.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="rounded-full bg-gray-100 dark:bg-gray-800 p-6 mb-4 inline-flex">
                        <Package className="h-12 w-12 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">No Batches to Transfer</h3>
                      <p className="text-muted-foreground mb-6">
                        You don't currently own any batches that can be transferred.
                      </p>
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
                              <FormLabel>Select Batch to Transfer</FormLabel>
                              <Select 
                                onValueChange={(value) => {
                                  field.onChange(value);
                                  onBatchChange(value);
                                }}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger className="h-12">
                                    <SelectValue placeholder="Choose a batch from your collection" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {ownedBatches.map((batch) => (
                                    <SelectItem key={batch.batch_pda} value={batch.batch_pda}>
                                      <div className="flex items-center gap-3 py-1">
                                        <Package className="h-4 w-4 text-primary" />
                                        <div>
                                          <div className="font-medium">{batch.product_name}</div>
                                          <div className="text-xs text-muted-foreground font-mono">
                                            {batch.batch_id}
                                          </div>
                                        </div>
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormDescription>
                                Select a batch that you currently own
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
                              <FormLabel>New Owner Wallet Address</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Enter the recipient's Solana wallet address" 
                                  {...field} 
                                  className="font-mono h-12"
                                />
                              </FormControl>
                              <FormDescription>
                                The Solana wallet address of the new owner
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                          <div className="flex items-start gap-3">
                            <CircleAlert className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                            <div>
                              <h4 className="font-medium text-amber-800 dark:text-amber-200 mb-1">
                                Important: Transfer is Permanent
                              </h4>
                              <p className="text-sm text-amber-700 dark:text-amber-300">
                                Once transferred, you will no longer have control over this batch. 
                                This action cannot be undone. Please verify the recipient's wallet address carefully.
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <Button 
                          type="submit" 
                          disabled={submitting || !selectedBatch}
                          size="lg"
                          className="w-full"
                        >
                          {submitting ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Processing Transfer...
                            </>
                          ) : (
                            <>
                              <Send className="h-4 w-4 mr-2" />
                              Transfer Batch Ownership
                            </>
                          )}
                        </Button>
                      </form>
                    </Form>
                  )}
                </CardContent>
              </Card>
            </div>
            
            {/* Transfer Preview & Info */}
            <div className="space-y-6">
              {/* Transfer Preview */}
              <Card className="sticky top-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-6 w-6 text-blue-500" />
                    Transfer Preview
                  </CardTitle>
                </CardHeader>
                
                <CardContent>
                  {selectedBatch ? (
                    <div className="space-y-4">
                      <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                        <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                          {selectedBatch.product_name}
                        </h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-blue-700 dark:text-blue-300">Batch ID:</span>
                            <span className="font-mono text-blue-900 dark:text-blue-100">
                              {selectedBatch.batch_id}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-blue-700 dark:text-blue-300">Mfg Date:</span>
                            <span className="text-blue-900 dark:text-blue-100">
                              {formatDate(selectedBatch.mfg_date)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-blue-700 dark:text-blue-300">Exp Date:</span>
                            <span className="text-blue-900 dark:text-blue-100">
                              {formatDate(selectedBatch.exp_date)}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border">
                        <h4 className="font-medium mb-3 flex items-center gap-2">
                          <Users className="h-4 w-4 text-gray-600" />
                          Ownership Transfer
                        </h4>
                        <div className="flex items-center justify-between">
                          <div className="text-center flex-1">
                            <div className="text-xs text-muted-foreground mb-1">Current Owner</div>
                            <div className="font-mono text-xs bg-white dark:bg-gray-700 p-2 rounded border">
                              {truncatePublicKey(selectedBatch.current_owner_wallet)}
                            </div>
                          </div>
                          
                          <ArrowRight className="h-4 w-4 mx-3 text-muted-foreground flex-shrink-0" />
                          
                          <div className="text-center flex-1">
                            <div className="text-xs text-muted-foreground mb-1">New Owner</div>
                            <div className="font-mono text-xs bg-white dark:bg-gray-700 p-2 rounded border">
                              {form.watch("newOwnerWallet") 
                                ? truncatePublicKey(form.watch("newOwnerWallet"))
                                : "Enter wallet address"}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="py-8 text-center">
                      <div className="rounded-full bg-gray-100 dark:bg-gray-800 p-4 mb-3 inline-flex">
                        <ArrowRightLeft className="h-8 w-8 text-gray-400" />
                      </div>
                      <p className="text-muted-foreground text-sm">
                        Select a batch to see transfer details
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Transfer Process Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-6 w-6 text-purple-500" />
                    Transfer Process
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex gap-3 p-3 rounded-lg bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-purple-600 dark:text-purple-400 font-semibold text-xs">
                        1
                      </div>
                      <div>
                        <h4 className="font-medium text-purple-900 dark:text-purple-100 text-sm">Verify Ownership</h4>
                        <p className="text-xs text-purple-700 dark:text-purple-300">
                          Confirm you are the current owner of the selected batch.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 font-semibold text-xs">
                        2
                      </div>
                      <div>
                        <h4 className="font-medium text-blue-900 dark:text-blue-100 text-sm">Blockchain Transaction</h4>
                        <p className="text-xs text-blue-700 dark:text-blue-300">
                          Execute transfer transaction on the Solana blockchain.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center text-green-600 dark:text-green-400 font-semibold text-xs">
                        3
                      </div>
                      <div>
                        <h4 className="font-medium text-green-900 dark:text-green-100 text-sm">Update Records</h4>
                        <p className="text-xs text-green-700 dark:text-green-300">
                          Update ownership records in the database.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                    <h4 className="font-medium mb-1 text-sm">💰 Transfer Fee</h4>
                    <p className="text-xs text-muted-foreground">
                      A small fee of 0.0005 SOL (~$0.05) is required for the blockchain transaction.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}