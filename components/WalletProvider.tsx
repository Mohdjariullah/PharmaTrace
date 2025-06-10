"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import { 
  ConnectionProvider, 
  WalletProvider as SolWalletProvider, 
  useWallet as useSolWallet 
} from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { NETWORK, RPC_ENDPOINT } from '@/lib/solana';
import dynamic from 'next/dynamic';

const WalletModalProvider = dynamic(
  () => import('@solana/wallet-adapter-react-ui').then(mod => mod.WalletModalProvider),
  { ssr: false }
);

require('@solana/wallet-adapter-react-ui/styles.css');

type WalletContextType = {
  connected: boolean;
  publicKey: string | null;
  wallet: ReturnType<typeof useSolWallet>;
  disconnectWallet: () => void;
};

const WalletContext = createContext<WalletContextType | null>(null);

export function useWalletContext() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWalletContext must be used within a WalletProvider');
  }
  return context;
}

function InnerWalletProvider({ children }: { children: React.ReactNode }) {
  const wallet = useSolWallet();
  const { connected, publicKey, disconnect } = wallet;
  const [publicKeyStr, setPublicKeyStr] = useState<string | null>(null);

  useEffect(() => {
    setPublicKeyStr(publicKey ? publicKey.toString() : null);
  }, [publicKey]);

  const disconnectWallet = async () => {
    try {
      await disconnect();
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
    }
  };

  const value = {
    connected,
    publicKey: publicKeyStr,
    wallet,
    disconnectWallet
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const network = NETWORK as WalletAdapterNetwork;
  const endpoint = RPC_ENDPOINT;

  const wallets = [
    new PhantomWalletAdapter(),
    new SolflareWalletAdapter(),
  ];

  return (
    <ConnectionProvider endpoint={endpoint}>
      <SolWalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <InnerWalletProvider>
            {children}
          </InnerWalletProvider>
        </WalletModalProvider>
      </SolWalletProvider>
    </ConnectionProvider>
  );
}