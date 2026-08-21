"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { getBatchesByOwner, updateBatchOwner, regenerateQrCodeForTransfer } from "@/services/supabaseService";
import { transferBatchOnChain } from "@/services/blockchainService";
import { insertBatchTransfer } from "@/services/supabaseService";
import { logBatchTransfer } from "@/services/auditService";
import { explainTransactionError } from "@/lib/walletErrors";
import DevnetBalanceNotice from "@/components/DevnetBalanceNotice";
import { Batch } from "@/types";
import { Separator } from "@/components/ui/separator";
import {
  ArrowRight,
  CircleAlert,
  Wallet,
  ArrowRightLeft,
  Package,
  Shield,
  CheckCircle,
  Send
} from "lucide-react";
import { formatDate } from "@/services/qrService";

const transferFormSchema = z.object({
  batchPDA: z.string().min(1, {
    message: "Please select a batch to transfer",
  }),
  newOwnerWallet: z.string().refine(isValidPublicKey, {
    message: "Please enter a valid Solana wallet address",
  }),
});

type TransferFormValues = z.infer<typeof transferFormSchema>;

const TRANSFER_STEPS = [
  { title: "Verify ownership", description: "Confirm you are the current owner of the selected batch." },
  { title: "Sign the transaction", description: "Execute the transfer instruction on Solana." },
  { title: "Update records", description: "Ownership records are updated in the database." },
];

export default function TransferPage() {
  const { toast } = useToast();
  const { connected, publicKey, wallet } = useWalletContext();
  const searchParams = useSearchParams();
  const preselectedBatchPDA = searchParams.get("batchPDA");

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

        if (preselectedBatchPDA) {
          const match = batches?.find((b) => b.batch_pda === preselectedBatchPDA) || null;
          if (match) {
            form.setValue("batchPDA", match.batch_pda);
            setSelectedBatch(match);
          }
        }
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
  }, [connected, publicKey, toast, preselectedBatchPDA]);

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

      const txSignature = await transferBatchOnChain(
        wallet,
        data.batchPDA,
        data.newOwnerWallet
      );

      await insertBatchTransfer({
        batch_id: selectedBatch.batch_id,
        from_wallet: publicKey,
        to_wallet: data.newOwnerWallet,
        tx_signature: txSignature,
      });

      await updateBatchOwner(selectedBatch.batch_id, data.newOwnerWallet);

      // The old QR (still showing the previous owner) is no longer the one
      // anyone should scan. This doesn't affect whether the transfer itself
      // succeeded - ownership has already moved on-chain and in the
      // database by this point - so a failure here is logged, not thrown.
      await regenerateQrCodeForTransfer(
        selectedBatch.batch_id,
        txSignature,
        selectedBatch.product_name,
        data.newOwnerWallet
      ).catch((qrError) => console.error("Failed to regenerate QR code after transfer:", qrError));

      logBatchTransfer(selectedBatch.batch_id, publicKey, data.newOwnerWallet, txSignature)
        .catch((auditError) => console.error("Failed to log transfer event:", auditError));

      setTransferComplete(true);

      toast({
        title: "Transfer successful",
        description: "The batch has been transferred to the new owner.",
      });

    } catch (error) {
      console.error("Error transferring batch:", error);
      const friendly = explainTransactionError(error);
      toast({
        title: friendly.title,
        description: friendly.description,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!connected) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Transfer batch</h1>
          <p className="mt-1 text-muted-foreground">
            Transfer ownership of a pharmaceutical batch to another wallet.
          </p>
        </div>

        <Card className="mx-auto max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-md border border-border bg-secondary/60">
              <Wallet className="h-5 w-5 text-primary" strokeWidth={1.75} />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Connect wallet to transfer</h3>
            <p className="mx-auto mt-1 max-w-sm text-muted-foreground">
              You need to connect your Solana wallet to transfer a batch to a new owner.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (transferComplete) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Transfer complete</h1>
          <p className="mt-1 text-muted-foreground">
            The batch has been successfully transferred to the new owner.
          </p>
        </div>

        <Card className="mx-auto max-w-3xl">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-md border border-border bg-secondary/60">
              <CheckCircle className="h-5 w-5 text-primary" strokeWidth={1.75} />
            </div>
            <CardTitle className="text-xl">Transfer successful</CardTitle>
            <p className="mt-1 text-muted-foreground">
              The batch ownership has been transferred on-chain.
            </p>
          </CardHeader>

          <CardContent>
            {selectedBatch && (
              <div className="mb-6 rounded-lg border border-border p-5">
                <h3 className="mb-4 flex items-center gap-2 font-semibold text-foreground">
                  <Package className="h-4 w-4 text-primary" strokeWidth={1.75} />
                  Transfer details
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Product</span>
                    <span className="font-medium">{selectedBatch.product_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Batch ID</span>
                    <span className="font-mono font-medium">{selectedBatch.batch_id}</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between pt-1">
                    <div className="text-center">
                      <div className="mb-1 text-xs text-muted-foreground">From</div>
                      <div className="rounded-md bg-secondary/60 px-2 py-1 font-mono text-xs">
                        {truncatePublicKey(publicKey || '')}
                      </div>
                    </div>

                    <ArrowRight className="mx-4 h-4 w-4 text-muted-foreground" />

                    <div className="text-center">
                      <div className="mb-1 text-xs text-muted-foreground">To</div>
                      <div className="rounded-md bg-secondary/60 px-2 py-1 font-mono text-xs">
                        {truncatePublicKey(form.getValues().newOwnerWallet)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col justify-center gap-3 sm:flex-row">
              <Button variant="outline" onClick={() => {
                form.reset();
                setTransferComplete(false);
                setSelectedBatch(null);
              }}>
                Transfer another batch
              </Button>

              <Button asChild>
                <a
                  href={`/verify?batchPDA=${form.getValues().batchPDA}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View batch details
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Transfer batch</h1>
        <p className="mt-1 text-muted-foreground">
          Transfer ownership of a pharmaceutical batch to another wallet.
        </p>
      </div>

      {publicKey && <DevnetBalanceNotice walletAddress={publicKey} />}

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                <ArrowRightLeft className="h-4 w-4 text-primary" strokeWidth={1.75} />
                Transfer ownership
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Select a batch you own and specify the new owner's wallet address.
              </p>
            </CardHeader>

            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
                </div>
              ) : ownedBatches.length === 0 ? (
                <div className="py-12 text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-md border border-border bg-secondary/60">
                    <Package className="h-5 w-5 text-primary" strokeWidth={1.75} />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">No batches to transfer</h3>
                  <p className="mt-1 text-muted-foreground">
                    You don't currently own any batches that can be transferred.
                  </p>
                  <Button asChild className="mt-6">
                    <a href="/register">Register a new batch</a>
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
                          <FormLabel>Select batch to transfer</FormLabel>
                          <Select
                            onValueChange={(value) => {
                              field.onChange(value);
                              onBatchChange(value);
                            }}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="h-11">
                                <SelectValue placeholder="Choose a batch from your collection" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {ownedBatches.map((batch) => (
                                <SelectItem key={batch.batch_pda} value={batch.batch_pda}>
                                  <div className="flex items-center gap-3 py-1">
                                    <Package className="h-4 w-4 text-primary" strokeWidth={1.75} />
                                    <div>
                                      <div className="font-medium">{batch.product_name}</div>
                                      <div className="font-mono text-xs text-muted-foreground">
                                        {batch.batch_id}
                                      </div>
                                    </div>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>Select a batch that you currently own</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="newOwnerWallet"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>New owner wallet address</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter the recipient's Solana wallet address"
                              {...field}
                              className="h-11 font-mono"
                            />
                          </FormControl>
                          <FormDescription>The Solana wallet address of the new owner</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="rounded-lg border border-border bg-secondary/40 p-4">
                      <div className="flex items-start gap-3">
                        <CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.75} />
                        <div>
                          <h4 className="text-sm font-medium text-foreground">Transfer is permanent</h4>
                          <p className="mt-1 text-sm text-muted-foreground">
                            Once transferred, you will no longer have control over this batch.
                            This action cannot be undone — verify the recipient's wallet address carefully.
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
                          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-primary-foreground" />
                          Processing transfer...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Transfer batch ownership
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base font-semibold">
                <Shield className="h-4 w-4 text-primary" strokeWidth={1.75} />
                Transfer preview
              </CardTitle>
            </CardHeader>

            <CardContent>
              {selectedBatch ? (
                <div className="space-y-4">
                  <div className="rounded-lg border border-border bg-secondary/40 p-4">
                    <h3 className="mb-2 font-semibold text-foreground">{selectedBatch.product_name}</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Batch ID</span>
                        <span className="font-mono">{selectedBatch.batch_id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Mfg date</span>
                        <span>{formatDate(selectedBatch.mfg_date)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Exp date</span>
                        <span>{formatDate(selectedBatch.exp_date)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg border border-border p-4">
                    <h4 className="mb-3 text-sm font-medium text-foreground">Ownership transfer</h4>
                    <div className="flex items-center justify-between">
                      <div className="flex-1 text-center">
                        <div className="mb-1 text-xs text-muted-foreground">Current owner</div>
                        <div className="rounded-md border border-border p-2 font-mono text-xs">
                          {truncatePublicKey(selectedBatch.current_owner_wallet)}
                        </div>
                      </div>

                      <ArrowRight className="mx-3 h-4 w-4 shrink-0 text-muted-foreground" />

                      <div className="flex-1 text-center">
                        <div className="mb-1 text-xs text-muted-foreground">New owner</div>
                        <div className="rounded-md border border-border p-2 font-mono text-xs">
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
                  <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-md border border-border bg-secondary/60">
                    <ArrowRightLeft className="h-4 w-4 text-primary" strokeWidth={1.75} />
                  </div>
                  <p className="text-sm text-muted-foreground">Select a batch to see transfer details</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Transfer process</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-3">
                {TRANSFER_STEPS.map((step, i) => (
                  <div key={step.title} className="flex gap-3">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border font-mono text-xs text-muted-foreground">
                      {i + 1}
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-foreground">{step.title}</h4>
                      <p className="text-xs text-muted-foreground">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="rounded-lg border border-border bg-secondary/40 p-3">
                <h4 className="text-sm font-medium text-foreground">Network fee</h4>
                <p className="mt-1 text-xs text-muted-foreground">
                  Standard Solana devnet transaction fees apply for the transfer instruction.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
