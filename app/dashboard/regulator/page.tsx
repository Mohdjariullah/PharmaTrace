"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Batch } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useWalletContext } from "@/components/WalletProvider";
import { getAllBatches } from "@/services/supabaseService";
import { flagBatchOnChain } from "@/services/blockchainService";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Flag, Search, X, Filter } from "lucide-react";
import { formatDate } from "@/services/qrService";
import { truncatePublicKey } from "@/lib/solana";
import BatchCard from "@/components/BatchCard";
import { Skeleton } from "@/components/ui/skeleton";

export default function RegulatorPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { connected, publicKey, wallet } = useWalletContext();

  const [batches, setBatches] = useState<Batch[]>([]);
  const [filteredBatches, setFilteredBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [view, setView] = useState<"table" | "grid">("table");
  
  // Flag dialog state
  const [showFlagDialog, setShowFlagDialog] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [flagReason, setFlagReason] = useState("");
  const [flagging, setFlagging] = useState(false);

  useEffect(() => {
    if (!connected) {
      toast({
        title: "Access Restricted",
        description: "Please connect your wallet to access the regulator dashboard.",
        variant: "destructive",
      });
      router.push("/dashboard");
      return;
    }

    const fetchBatches = async () => {
      try {
        setLoading(true);
        const data = await getAllBatches();
        setBatches(data || []);
        setFilteredBatches(data || []);
      } catch (error) {
        console.error("Error fetching batches:", error);
        toast({
          title: "Error",
          description: "Failed to load batches. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBatches();
  }, [connected, router, toast]);

  // Apply filters when search or statusFilter changes
  useEffect(() => {
    let result = batches;
    
    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(
        (batch) =>
          batch.product_name.toLowerCase().includes(searchLower) ||
          batch.batch_id.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply status filter
    if (statusFilter !== "all") {
      const statusValue = parseInt(statusFilter);
      result = result.filter((batch) => batch.status === statusValue);
    }
    
    setFilteredBatches(result);
  }, [search, statusFilter, batches]);

  const handleOpenFlagDialog = (batch: Batch) => {
    setSelectedBatch(batch);
    setFlagReason("");
    setShowFlagDialog(true);
  };

  const handleFlagBatch = async () => {
    if (!selectedBatch || !wallet) return;
    
    try {
      setFlagging(true);
      
      // Call blockchain service to flag batch
      const txSignature = await flagBatchOnChain(
        wallet,
        selectedBatch.batch_pda,
        flagReason
      );
      
      // Update local state
      const updatedBatches = batches.map((batch) =>
        batch.batch_id === selectedBatch.batch_id
          ? { ...batch, status: 1 }
          : batch
      );
      
      setBatches(updatedBatches);
      setFilteredBatches(updatedBatches);
      
      toast({
        title: "Batch Flagged",
        description: "The batch has been successfully flagged as suspicious.",
      });
      
      setShowFlagDialog(false);
      
    } catch (error) {
      console.error("Error flagging batch:", error);
      toast({
        title: "Error",
        description: "Failed to flag batch. Please try again.",
        variant: "destructive",
      });
    } finally {
      setFlagging(false);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        heading="Regulator Dashboard"
        text="Monitor and manage pharmaceutical batches across the supply chain"
      />

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div>
              <CardTitle>Batch Management</CardTitle>
              <CardDescription>
                View, filter, and flag pharmaceutical batches
              </CardDescription>
            </div>
            
            <Tabs 
              defaultValue="table" 
              value={view} 
              onValueChange={(v) => setView(v as "table" | "grid")}
              className="w-full sm:w-auto"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="table">Table</TabsTrigger>
                <TabsTrigger value="grid">Grid</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search batches..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
              {search && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-9 w-9"
                  onClick={() => setSearch("")}
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Clear search</span>
                </Button>
              )}
            </div>
            
            <div className="flex gap-2 items-center">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select
                value={statusFilter}
                onValueChange={setStatusFilter}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="0">Valid</SelectItem>
                  <SelectItem value="1">Flagged</SelectItem>
                  <SelectItem value="2">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {loading ? (
            view === "table" ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-64 w-full" />
                ))}
              </div>
            )
          ) : filteredBatches.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No batches found matching your criteria</p>
            </div>
          ) : view === "table" ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Batch ID</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Manufacturer</TableHead>
                    <TableHead>Current Owner</TableHead>
                    <TableHead>Expiry</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBatches.map((batch) => (
                    <TableRow key={batch.batch_id}>
                      <TableCell className="font-mono text-xs">
                        {batch.batch_id}
                      </TableCell>
                      <TableCell>{batch.product_name}</TableCell>
                      <TableCell className="font-mono text-xs">
                        {truncatePublicKey(batch.manufacturer_wallet)}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {truncatePublicKey(batch.current_owner_wallet)}
                      </TableCell>
                      <TableCell>{formatDate(batch.exp_date)}</TableCell>
                      <TableCell>
                        {batch.status === 0 && (
                          <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                            Valid
                          </span>
                        )}
                        {batch.status === 1 && (
                          <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
                            Flagged
                          </span>
                        )}
                        {batch.status === 2 && (
                          <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                            Expired
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/verify?batchPDA=${batch.batch_pda}`)}
                        >
                          View
                        </Button>
                        {batch.status === 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                            onClick={() => handleOpenFlagDialog(batch)}
                          >
                            <Flag className="h-4 w-4 mr-1" />
                            Flag
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredBatches.map((batch) => (
                <BatchCard
                  key={batch.batch_id}
                  batch={batch}
                  onFlag={batch.status === 0 ? () => handleOpenFlagDialog(batch) : undefined}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Flag Batch Dialog */}
      <Dialog open={showFlagDialog} onOpenChange={setShowFlagDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Flag Suspicious Batch</DialogTitle>
            <DialogDescription>
              Flagging a batch will mark it as suspicious on the blockchain.
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {selectedBatch && (
            <div className="py-4">
              <div className="space-y-2 mb-4">
                <div className="font-medium">Batch Details</div>
                <div className="text-sm">
                  <span className="text-muted-foreground">ID:</span>{" "}
                  <span className="font-mono">{selectedBatch.batch_id}</span>
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Product:</span>{" "}
                  {selectedBatch.product_name}
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="reason" className="block text-sm font-medium">
                  Reason for flagging
                </label>
                <Textarea
                  id="reason"
                  value={flagReason}
                  onChange={(e) => setFlagReason(e.target.value)}
                  placeholder="Provide a detailed reason for flagging this batch..."
                  rows={4}
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowFlagDialog(false)}
              disabled={flagging}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleFlagBatch}
              disabled={!flagReason.trim() || flagging}
            >
              {flagging ? "Flagging..." : "Flag Batch"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}