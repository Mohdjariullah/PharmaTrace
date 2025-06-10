"use client";

import { Button } from "@/components/ui/button";
import { useWalletContext } from "@/components/WalletProvider";
import { truncatePublicKey } from "@/lib/solana";
import { Wallet, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { useToast } from "@/hooks/use-toast";

export default function WalletConnect() {
  const { connected, publicKey, disconnectWallet } = useWalletContext();
  const { setVisible } = useWalletModal();
  const { toast } = useToast();

  const handleConnect = () => {
    try {
      setVisible(true);
    } catch (error) {
      console.error('Error opening wallet modal:', error);
      toast({
        title: "Connection failed",
        description: "There was a problem opening the wallet selector.",
        variant: "destructive"
      });
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnectWallet();
      toast({
        title: "Wallet disconnected",
        description: "Your Solana wallet has been disconnected."
      });
    } catch (error) {
      console.error(error);
    }
  };

  if (!connected || !publicKey) {
    return (
      <Button onClick={handleConnect} className="gap-2">
        <Wallet className="h-4 w-4" />
        Connect Wallet
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Wallet className="h-4 w-4" />
          {truncatePublicKey(publicKey)}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem 
          className="gap-2 text-destructive focus:text-destructive"
          onClick={handleDisconnect}
        >
          <LogOut className="h-4 w-4" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}