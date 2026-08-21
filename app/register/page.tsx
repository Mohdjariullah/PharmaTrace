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
import { CalendarIcon, Package, Shield, Zap, CheckCircle, AlertTriangle, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { registerBatchTransaction } from "@/services/blockchainService";
import { insertBatchMetadata, insertQrCode, getBatchById } from "@/services/supabaseService";
import { logBatchRegistration } from "@/services/auditService";
import { explainTransactionError } from "@/lib/walletErrors";
import DevnetBalanceNotice from "@/components/DevnetBalanceNotice";

const QrGenerator = dynamic(() => import("@/components/QrGenerator"), {
  ssr: false,
  loading: () => <div className="h-[280px] w-[280px] animate-pulse rounded-lg bg-secondary/60" />,
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

const REGISTRATION_STEPS = [
  { title: "Enter batch details", description: "Provide the batch ID, product name, and dates." },
  { title: "Sign the transaction", description: "A transaction is sent to the PharmaTrace program on Solana." },
  { title: "Generate QR code", description: "A unique QR code is created with the transaction hash and batch info." },
  { title: "Track & verify", description: "Anyone can scan the QR code to verify the batch on-chain." },
];

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

      const { txSignature, batchId, productName, batchPDA } = await registerBatchTransaction(
        wallet,
        data.batchId,
        data.productName,
        mfgDateStr,
        expDateStr,
        data.ipfsHash || ''
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

      await insertQrCode({
        tx_signature: txSignature,
        batch_id: data.batchId,
        medicine_name: data.productName,
        owner_address: publicKey,
      });

      logBatchRegistration(data.batchId, data.productName, publicKey, txSignature)
        .catch((auditError) => console.error("Failed to log registration event:", auditError));

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

      const errorMessage = (error?.message || "").toLowerCase();
      if (errorMessage.includes("already exists")) {
        errorTitle = "Batch already exists";
        errorDescription = error.message;
      } else if (errorMessage.includes("duplicate key")) {
        errorTitle = "Batch ID already exists";
        errorDescription = "This batch ID is already registered. Please use a different batch ID.";
      } else {
        const friendly = explainTransactionError(error);
        errorTitle = friendly.title;
        errorDescription = friendly.description;
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
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Register new batch</h1>
          <p className="mt-1 text-muted-foreground">
            Create an immutable record of a pharmaceutical batch on-chain.
          </p>
        </div>

        <Card className="mx-auto max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-md border border-border bg-secondary/60">
              <Wallet className="h-5 w-5 text-primary" strokeWidth={1.75} />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Connect wallet to register</h3>
            <p className="mx-auto mt-1 max-w-sm text-muted-foreground">
              You need to connect your Solana wallet to register a new pharmaceutical batch on-chain.
            </p>
            <Button onClick={() => router.push("/dashboard")} className="mt-6">
              Return to dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Register new batch</h1>
        <p className="mt-1 text-muted-foreground">
          Create an immutable record of a pharmaceutical batch on-chain.
        </p>
      </div>

      {!registeredBatch && publicKey && <DevnetBalanceNotice walletAddress={publicKey} />}

      {registeredBatch ? (
        <Card>
          <CardHeader className="text-center pb-4">
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-md border border-border bg-secondary/60">
              <CheckCircle className="h-5 w-5 text-primary" strokeWidth={1.75} />
            </div>
            <CardTitle className="text-xl">Batch registered successfully</CardTitle>
            <p className="mt-1 text-muted-foreground">
              Your batch is now recorded on-chain and ready for tracking.
            </p>
          </CardHeader>

          <CardContent>
            <div className="grid gap-8 lg:grid-cols-2">
              <div className="space-y-4">
                <div className="rounded-lg border border-border p-5">
                  <h3 className="mb-4 flex items-center gap-2 font-semibold text-foreground">
                    <Package className="h-4 w-4 text-primary" strokeWidth={1.75} />
                    Batch details
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Batch ID</span>
                      <span className="font-mono font-medium">{registeredBatch.batchId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Product</span>
                      <span className="font-medium">{registeredBatch.productName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Transaction</span>
                      <span className="font-mono">{registeredBatch.txSignature.substring(0, 8)}...</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Owner</span>
                      <span className="font-mono">{registeredBatch.ownerAddress.substring(0, 8)}...</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-border p-5">
                  <h3 className="mb-3 flex items-center gap-2 font-semibold text-foreground">
                    <Shield className="h-4 w-4 text-primary" strokeWidth={1.75} />
                    Verification
                  </h3>
                  <p className="mb-4 text-sm text-muted-foreground">
                    Use the QR code to verify this batch's authenticity throughout the supply chain.
                    Anyone can scan it to check the transaction on-chain.
                  </p>
                  <div className="flex gap-3">
                    <Button onClick={() => setRegisteredBatch(null)} variant="outline" size="sm">
                      Register another batch
                    </Button>
                    <Button
                      onClick={() => router.push(`/verify?txSignature=${registeredBatch.txSignature}`)}
                      size="sm"
                    >
                      View verification
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
      ) : (
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Batch information</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Enter the details of the pharmaceutical batch to register on-chain.
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
                              <Input placeholder="BATCH123" {...field} className="h-11 font-mono" />
                            </FormControl>
                            <FormDescription>A unique identifier for this batch</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="productName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Product name</FormLabel>
                            <FormControl>
                              <Input placeholder="Medication name" {...field} className="h-11" />
                            </FormControl>
                            <FormDescription>The name of the pharmaceutical product</FormDescription>
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
                            <FormLabel>Manufacturing date</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    className={cn(
                                      "h-11 pl-3 text-left font-normal",
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
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
                            <FormLabel>Expiry date</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    className={cn(
                                      "h-11 pl-3 text-left font-normal",
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  disabled={(date) => date < new Date() || date < new Date("1900-01-01")}
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
                          <FormLabel>IPFS hash (optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="QmHashExample..." {...field} className="h-11 font-mono" />
                          </FormControl>
                          <FormDescription>IPFS hash for additional metadata (optional)</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="rounded-lg border border-border bg-secondary/40 p-4">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.75} />
                        <div>
                          <h4 className="text-sm font-medium text-foreground">Batch ID must be unique</h4>
                          <p className="mt-1 text-sm text-muted-foreground">
                            Each batch ID can only be registered once. If you see an error about a
                            duplicate batch ID, choose a different identifier.
                          </p>
                        </div>
                      </div>
                    </div>

                    <Button type="submit" disabled={submitting} size="lg" className="w-full">
                      {submitting ? (
                        <>
                          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-primary-foreground" />
                          Registering on blockchain...
                        </>
                      ) : (
                        <>
                          <Zap className="mr-2 h-4 w-4" />
                          Register batch on blockchain
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base font-semibold">
                  <Shield className="h-4 w-4 text-primary" strokeWidth={1.75} />
                  Registration process
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-5">
                <div className="space-y-4">
                  {REGISTRATION_STEPS.map((step, i) => (
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

                <div className="rounded-lg border border-border bg-secondary/40 p-4">
                  <h4 className="text-sm font-medium text-foreground">Network fee</h4>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Standard Solana devnet transaction fees apply — a fraction of a cent per registration.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
