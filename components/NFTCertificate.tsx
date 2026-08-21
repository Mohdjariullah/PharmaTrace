"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Award,
  ExternalLink,
  Shield,
  Zap,
  Copy,
  Download,
  Share2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useWalletContext } from '@/components/WalletProvider';
import { mintNFTCertificate, NFTCertificate as NFTCert, NFTMetadata } from '@/services/nftService';
import { logNFTMinting } from '@/services/auditService';
import { Batch } from '@/types';
import { getExplorerUrl } from '@/lib/solana';

interface NFTCertificateProps {
  batch: Batch;
  existingNFT?: NFTCert;
}

const CERTIFICATE_FEATURES = [
  { icon: Shield, title: "Immutable proof", description: "Permanent record on blockchain" },
  { icon: CheckCircle, title: "Authenticity", description: "Cryptographically verified" },
  { icon: Zap, title: "Transferable", description: "Can be transferred with batch" },
];

export default function NFTCertificate({ batch, existingNFT }: NFTCertificateProps) {
  const [minting, setMinting] = useState(false);
  const [nftCertificate, setNftCertificate] = useState<NFTCert | null>(existingNFT || null);
  const { toast } = useToast();
  const { connected, wallet, publicKey } = useWalletContext();

  const handleMintNFT = async () => {
    if (!connected || !wallet || !publicKey) {
      toast({
        title: "Wallet required",
        description: "Please connect your wallet to mint an NFT certificate.",
        variant: "destructive",
      });
      return;
    }

    try {
      setMinting(true);

      const certificate = await mintNFTCertificate(wallet, batch);
      setNftCertificate(certificate);

      await logNFTMinting(
        batch.batch_id,
        publicKey,
        certificate.mintAddress,
        certificate.txSignature,
        {
          product_name: batch.product_name,
          mint_address: certificate.mintAddress,
          metadata_uri: certificate.metadata.image
        }
      );

      toast({
        title: "NFT certificate minted",
        description: "Your pharmaceutical batch now has a unique NFT certificate.",
      });

    } catch (error: any) {
      console.error('Error minting NFT:', error);
      toast({
        title: "Minting failed",
        description: error.message || "Failed to mint NFT certificate. Please try again.",
        variant: "destructive",
      });
    } finally {
      setMinting(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: `${label} copied to clipboard.`,
    });
  };

  const downloadCertificate = () => {
    if (!nftCertificate) return;

    const certificateData = {
      batch_id: batch.batch_id,
      product_name: batch.product_name,
      nft_mint: nftCertificate.mintAddress,
      metadata: nftCertificate.metadata,
      issued_date: new Date().toISOString(),
      blockchain: 'Solana',
      network: 'Devnet'
    };

    const blob = new Blob([JSON.stringify(certificateData, null, 2)], {
      type: 'application/json'
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pharmatrace-certificate-${batch.batch_id}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (!nftCertificate) {
    return (
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-md border border-border bg-secondary/60">
            <Award className="h-5 w-5 text-primary" strokeWidth={1.75} />
          </div>
          <CardTitle className="text-xl">NFT certificate available</CardTitle>
          <p className="text-muted-foreground">
            Create a unique digital certificate for this pharmaceutical batch
          </p>
        </CardHeader>

        <CardContent className="space-y-6 text-center">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {CERTIFICATE_FEATURES.map((feature) => (
              <div key={feature.title} className="flex flex-col items-center rounded-lg border border-border p-4">
                <feature.icon className="mb-2 h-5 w-5 text-primary" strokeWidth={1.75} />
                <h4 className="text-sm font-semibold text-foreground">{feature.title}</h4>
                <p className="text-center text-xs text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>

          <div className="rounded-lg border border-border p-5 text-left">
            <h4 className="mb-3 font-semibold text-foreground">Certificate will include</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Batch ID:</span>
                <span className="font-mono">{batch.batch_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Product:</span>
                <span>{batch.product_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Mfg date:</span>
                <span>{new Date(batch.mfg_date).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Exp date:</span>
                <span>{new Date(batch.exp_date).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <Button onClick={handleMintNFT} disabled={minting || !connected} className="w-full">
            {minting ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-primary-foreground" />
                Minting NFT certificate...
              </>
            ) : (
              <>
                <Award className="mr-2 h-4 w-4" />
                Mint NFT certificate
              </>
            )}
          </Button>

          {!connected && (
            <p className="text-sm text-muted-foreground">
              Connect your wallet to mint an NFT certificate
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md border border-border bg-secondary/60">
              <Award className="h-5 w-5 text-primary" strokeWidth={1.75} />
            </div>
            <div>
              <CardTitle className="text-lg">NFT certificate</CardTitle>
              <p className="text-sm text-muted-foreground">Blockchain-verified authenticity</p>
            </div>
          </div>
          <Badge variant="outline" className="gap-1.5">
            <CheckCircle className="h-3 w-3" />
            Minted
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="rounded-lg border border-dashed border-border p-6">
          <div className="mb-4 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-border bg-secondary/60">
              <Award className="h-8 w-8 text-primary" strokeWidth={1.75} />
            </div>
            <h3 className="text-lg font-semibold text-foreground">
              {nftCertificate.metadata.name}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {nftCertificate.metadata.description}
            </p>
          </div>

          <Separator className="my-4" />

          <div className="grid grid-cols-2 gap-4 text-sm">
            {nftCertificate.metadata.attributes.map((attr, index) => (
              <div key={index} className="flex justify-between">
                <span className="text-muted-foreground">{attr.trait_type}:</span>
                <span className="font-medium">{attr.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="flex items-center gap-2 font-semibold text-foreground">
            <Shield className="h-4 w-4 text-primary" strokeWidth={1.75} />
            Certificate details
          </h4>

          <div className="space-y-3 rounded-lg border border-border p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Mint address:</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs">{nftCertificate.mintAddress.substring(0, 8)}...{nftCertificate.mintAddress.slice(-8)}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => copyToClipboard(nftCertificate.mintAddress, 'Mint address')}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Token address:</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs">{nftCertificate.tokenAddress.substring(0, 8)}...{nftCertificate.tokenAddress.slice(-8)}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => copyToClipboard(nftCertificate.tokenAddress, 'Token address')}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Transaction:</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs">{nftCertificate.txSignature.substring(0, 8)}...{nftCertificate.txSignature.slice(-8)}</span>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0" asChild>
                  <a href={getExplorerUrl(nftCertificate.txSignature)} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button variant="outline" onClick={downloadCertificate} className="flex-1">
            <Download className="mr-2 h-4 w-4" />
            Download certificate
          </Button>

          <Button
            variant="outline"
            onClick={() => copyToClipboard(nftCertificate.mintAddress, 'NFT mint address')}
            className="flex-1"
          >
            <Copy className="mr-2 h-4 w-4" />
            Copy mint address
          </Button>

          <Button asChild className="flex-1">
            <a href={getExplorerUrl(nftCertificate.mintAddress, 'address')} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" />
              View on explorer
            </a>
          </Button>
        </div>

        <div className="rounded-lg border border-border bg-secondary/40 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.75} />
            <div>
              <h4 className="text-sm font-medium text-foreground">Certificate security</h4>
              <p className="mt-1 text-sm text-muted-foreground">
                This NFT certificate is permanently recorded on the Solana blockchain and cannot be
                counterfeited. It serves as immutable proof of this pharmaceutical batch's authenticity.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
