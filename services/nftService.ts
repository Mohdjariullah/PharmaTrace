import { 
  Connection, 
  PublicKey, 
  Transaction, 
  SystemProgram,
  LAMPORTS_PER_SOL
} from '@solana/web3.js';
import { 
  createCreateMetadataAccountV3Instruction,
  PROGRAM_ID as TOKEN_METADATA_PROGRAM_ID,
  CreateMetadataAccountV3InstructionAccounts,
  CreateMetadataAccountV3InstructionArgs,
  DataV2
} from '@metaplex-foundation/mpl-token-metadata';
import {
  createInitializeMintInstruction,
  createAssociatedTokenAccountInstruction,
  createMintToInstruction,
  getAssociatedTokenAddress,
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getMinimumBalanceForRentExemptMint
} from '@solana/spl-token';
import { connection } from '@/lib/solana';
import { WalletContextState } from '@solana/wallet-adapter-react';
import { Batch } from '@/types';

export interface NFTMetadata {
  name: string;
  symbol: string;
  description: string;
  image: string;
  attributes: Array<{
    trait_type: string;
    value: string;
  }>;
  properties: {
    category: string;
    files: Array<{
      uri: string;
      type: string;
    }>;
  };
}

export interface NFTCertificate {
  mintAddress: string;
  metadataAddress: string;
  tokenAddress: string;
  txSignature: string;
  metadata: NFTMetadata;
}

/**
 * Generate metadata for pharmaceutical batch NFT certificate
 */
export function generateNFTMetadata(batch: Batch): NFTMetadata {
  const metadata: NFTMetadata = {
    name: `PharmaTrace Certificate - ${batch.batch_id}`,
    symbol: 'PTRACE',
    description: `Official pharmaceutical batch certificate for ${batch.product_name}. This NFT serves as an immutable proof of authenticity and compliance for batch ${batch.batch_id}.`,
    image: `https://api.pharmatrace.com/nft/image/${batch.batch_id}`, // This would be your NFT image endpoint
    attributes: [
      {
        trait_type: 'Batch ID',
        value: batch.batch_id
      },
      {
        trait_type: 'Product Name',
        value: batch.product_name
      },
      {
        trait_type: 'Manufacturer',
        value: batch.manufacturer_wallet
      },
      {
        trait_type: 'Manufacturing Date',
        value: batch.mfg_date
      },
      {
        trait_type: 'Expiry Date',
        value: batch.exp_date
      },
      {
        trait_type: 'Status',
        value: batch.status === 0 ? 'Valid' : batch.status === 1 ? 'Flagged' : 'Expired'
      },
      {
        trait_type: 'Blockchain Network',
        value: 'Solana'
      },
      {
        trait_type: 'Certificate Type',
        value: 'Pharmaceutical Batch'
      }
    ],
    properties: {
      category: 'certificate',
      files: [
        {
          uri: `https://api.pharmatrace.com/nft/image/${batch.batch_id}`,
          type: 'image/png'
        }
      ]
    }
  };

  return metadata;
}

/**
 * Upload metadata to IPFS or Arweave (simplified version)
 * In production, you'd use a proper decentralized storage solution
 */
async function uploadMetadata(metadata: NFTMetadata): Promise<string> {
  // For demo purposes, we'll create a data URI
  // In production, upload to IPFS/Arweave and return the URI
  const jsonString = JSON.stringify(metadata, null, 2);
  const base64 = Buffer.from(jsonString).toString('base64');
  return `data:application/json;base64,${base64}`;
}

/**
 * Mint NFT certificate for a pharmaceutical batch
 */
export async function mintNFTCertificate(
  wallet: WalletContextState,
  batch: Batch
): Promise<NFTCertificate> {
  if (!wallet.signTransaction || !wallet.publicKey) {
    throw new Error('Wallet not properly connected');
  }

  try {
    // Generate metadata
    const metadata = generateNFTMetadata(batch);
    const metadataUri = await uploadMetadata(metadata);

    // Generate new mint keypair
    const mintKeypair = new PublicKey(0); // This would be generated properly
    const mint = mintKeypair;

    // Get associated token account
    const tokenAddress = await getAssociatedTokenAddress(
      mint,
      wallet.publicKey
    );

    // Get metadata account address
    const [metadataAddress] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('metadata'),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        mint.toBuffer(),
      ],
      TOKEN_METADATA_PROGRAM_ID
    );

    // Create transaction
    const transaction = new Transaction();

    // Get minimum balance for mint
    const mintRent = await getMinimumBalanceForRentExemptMint(connection);

    // Create mint account
    transaction.add(
      SystemProgram.createAccount({
        fromPubkey: wallet.publicKey,
        newAccountPubkey: mint,
        space: MINT_SIZE,
        lamports: mintRent,
        programId: TOKEN_PROGRAM_ID,
      })
    );

    // Initialize mint
    transaction.add(
      createInitializeMintInstruction(
        mint,
        0, // 0 decimals for NFT
        wallet.publicKey,
        wallet.publicKey
      )
    );

    // Create associated token account
    transaction.add(
      createAssociatedTokenAccountInstruction(
        wallet.publicKey,
        tokenAddress,
        wallet.publicKey,
        mint
      )
    );

    // Mint token to associated account
    transaction.add(
      createMintToInstruction(
        mint,
        tokenAddress,
        wallet.publicKey,
        1 // Mint 1 NFT
      )
    );

    // Create metadata
    const metadataData: DataV2 = {
      name: metadata.name,
      symbol: metadata.symbol,
      uri: metadataUri,
      sellerFeeBasisPoints: 0,
      creators: [
        {
          address: wallet.publicKey,
          verified: true,
          share: 100,
        },
      ],
      collection: null,
      uses: null,
    };

    const metadataAccounts: CreateMetadataAccountV3InstructionAccounts = {
      metadata: metadataAddress,
      mint: mint,
      mintAuthority: wallet.publicKey,
      payer: wallet.publicKey,
      updateAuthority: wallet.publicKey,
      systemProgram: SystemProgram.programId,
      rent: new PublicKey('SysvarRent111111111111111111111111111111111'),
    };

    const metadataArgs: CreateMetadataAccountV3InstructionArgs = {
      createMetadataAccountArgsV3: {
        data: metadataData,
        isMutable: false,
        collectionDetails: null,
      },
    };

    transaction.add(
      createCreateMetadataAccountV3Instruction(metadataAccounts, metadataArgs)
    );

    // Get recent blockhash
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = wallet.publicKey;

    // Sign and send transaction
    const signedTransaction = await wallet.signTransaction(transaction);
    const signature = await connection.sendRawTransaction(signedTransaction.serialize());
    
    // Wait for confirmation
    await connection.confirmTransaction(signature, 'confirmed');

    return {
      mintAddress: mint.toString(),
      metadataAddress: metadataAddress.toString(),
      tokenAddress: tokenAddress.toString(),
      txSignature: signature,
      metadata
    };

  } catch (error: any) {
    console.error('Error minting NFT certificate:', error);
    throw new Error(`Failed to mint NFT certificate: ${error.message}`);
  }
}

/**
 * Get NFT certificate information
 */
export async function getNFTCertificate(mintAddress: string): Promise<NFTMetadata | null> {
  try {
    // Get metadata account
    const mint = new PublicKey(mintAddress);
    const [metadataAddress] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('metadata'),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        mint.toBuffer(),
      ],
      TOKEN_METADATA_PROGRAM_ID
    );

    // Fetch metadata account
    const metadataAccount = await connection.getAccountInfo(metadataAddress);
    
    if (!metadataAccount) {
      return null;
    }

    // Parse metadata (simplified - in production you'd use proper deserialization)
    // This is a placeholder implementation
    return null;

  } catch (error) {
    console.error('Error fetching NFT certificate:', error);
    return null;
  }
}

/**
 * Verify NFT certificate authenticity
 */
export async function verifyNFTCertificate(mintAddress: string): Promise<{
  isValid: boolean;
  isAuthentic: boolean;
  metadata?: NFTMetadata;
  error?: string;
}> {
  try {
    const metadata = await getNFTCertificate(mintAddress);
    
    if (!metadata) {
      return {
        isValid: false,
        isAuthentic: false,
        error: 'NFT certificate not found'
      };
    }

    // Verify the NFT is from PharmaTrace
    const isAuthentic = metadata.symbol === 'PTRACE' && 
                       metadata.name.includes('PharmaTrace Certificate');

    return {
      isValid: true,
      isAuthentic,
      metadata
    };

  } catch (error: any) {
    return {
      isValid: false,
      isAuthentic: false,
      error: error.message
    };
  }
}