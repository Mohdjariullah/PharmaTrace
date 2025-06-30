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

export default function NFTCertificate({ batch, existingNFT }: NFTCertificateProps) {
  const [minting, setMinting] = useState(false);
  const [nftCertificate, setNftCertificate] = useState<NFTCert | null>(existingNFT || null);
  const { toast } = useToast();
  const { connected, wallet, publicKey } = useWalletContext();

  const handleMintNFT = async () => {
    if (!connected || !wallet || !publicKey) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to mint an NFT certificate.",
        variant: "destructive",
      });
      return;
    }

    try {
      setMinting(true);
      
      const certificate = await mintNFTCertificate(wallet, batch);
      setNftCertificate(certificate);

      // Log the NFT minting event
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
        title: "NFT Certificate Minted!",
        description: "Your pharmaceutical batch now has a unique NFT certificate.",
      });

    } catch (error: any) {
      console.error('Error minting NFT:', error);
      toast({
        title: "Minting Failed",
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
      title: "Copied!",
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
      <Card className="border-2 border-dashed border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/10 dark:to-pink-900/10">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center">
            <Award className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl text-purple-800 dark:text-purple-200">
            NFT Certificate Available
          </CardTitle>
          <p className="text-purple-700 dark:text-purple-300">
            Create a unique digital certificate for this pharmaceutical batch
          </p>
        </CardHeader>
        
        <CardContent className="text-center space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col items-center p-4 bg-white dark:bg-gray-800 rounded-xl border">
              <Shield className="h-8 w-8 text-blue-600 mb-2" />
              <h4 className="font-semibold text-sm">Immutable Proof</h4>
              <p className="text-xs text-muted-foreground text-center">
                Permanent record on blockchain
              </p>
            </div>
            
            <div className="flex flex-col items-center p-4 bg-white dark:bg-gray-800 rounded-xl border">
              <CheckCircle className="h-8 w-8 text-green-600 mb-2" />
              <h4 className="font-semibold text-sm">Authenticity</h4>
              <p className="text-xs text-muted-foreground text-center">
                Cryptographically verified
              </p>
            </div>
            
            <div className="flex flex-col items-center p-4 bg-white dark:bg-gray-800 rounded-xl border">
              <Zap className="h-8 w-8 text-purple-600 mb-2" />
              <h4 className="font-semibold text-sm">Transferable</h4>
              <p className="text-xs text-muted-foreground text-center">
                Can be transferred with batch
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border">
            <h4 className="font-semibold mb-3">Certificate Will Include:</h4>
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
                <span className="text-muted-foreground">Mfg Date:</span>
                <span>{new Date(batch.mfg_date).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Exp Date:</span>
                <span>{new Date(batch.exp_date).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <Button
            onClick={handleMintNFT}
            disabled={minting || !connected}
            size="lg"
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            {minting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                Minting NFT Certificate...
              </>
            ) : (
              <>
                <Award className="h-5 w-5 mr-3" />
                Mint NFT Certificate
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
    <Card className="border-2 border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/10 dark:to-pink-900/10 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-xl">NFT Certificate</CardTitle>
              <p className="text-purple-100">Blockchain-verified authenticity</p>
            </div>
          </div>
          <Badge className="bg-green-100 text-green-700 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Minted
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Certificate Preview */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border-2 border-dashed border-purple-200 dark:border-purple-700">
          <div className="text-center mb-4">
            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
              <Award className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-xl font-bold text-purple-800 dark:text-purple-200">
              {nftCertificate.metadata.name}
            </h3>
            <p className="text-sm text-muted-foreground mt-2">
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

        {/* NFT Details */}
        <div className="space-y-4">
          <h4 className="font-semibold flex items-center gap-2">
            <Shield className="h-4 w-4 text-blue-600" />
            Certificate Details
          </h4>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Mint Address:</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs">{nftCertificate.mintAddress.substring(0, 8)}...{nftCertificate.mintAddress.substring(-8)}</span>
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
              <span className="text-sm text-muted-foreground">Token Address:</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs">{nftCertificate.tokenAddress.substring(0, 8)}...{nftCertificate.tokenAddress.substring(-8)}</span>
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
                <span className="font-mono text-xs">{nftCertificate.txSignature.substring(0, 8)}...{nftCertificate.txSignature.substring(-8)}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  asChild
                >
                  <a href={getExplorerUrl(nftCertificate.txSignature)} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            onClick={downloadCertificate}
            className="flex-1"
          >
            <Download className="h-4 w-4 mr-2" />
            Download Certificate
          </Button>
          
          <Button
            variant="outline"
            onClick={() => copyToClipboard(nftCertificate.mintAddress, 'NFT mint address')}
            className="flex-1"
          >
            <Copy className="h-4 w-4 mr-2" />
            Copy Mint Address
          </Button>
          
          <Button
            asChild
            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600"
          >
            <a href={getExplorerUrl(nftCertificate.mintAddress, 'address')} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" />
              View on Explorer
            </a>
          </Button>
        </div>

        {/* Security Notice */}
        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-1">
                Certificate Security
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                This NFT certificate is permanently recorded on the Solana blockchain and cannot be counterfeited. 
                It serves as immutable proof of this pharmaceutical batch's authenticity and compliance.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}