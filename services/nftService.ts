import {
  PublicKey,
  Transaction,
  SystemProgram,
  Keypair,
} from '@solana/web3.js';
import {
  createCreateMetadataAccountV3Instruction,
  PROGRAM_ID as TOKEN_METADATA_PROGRAM_ID,
  CreateMetadataAccountV3InstructionAccounts,
  CreateMetadataAccountV3InstructionArgs,
  DataV2,
  Metadata
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
  metadataUri: string;
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
    const mintKeypair = Keypair.generate();
    const mint = mintKeypair.publicKey;

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

    // The mint account is brand new, so it must co-sign its own creation
    // before the wallet signs as fee payer.
    transaction.partialSign(mintKeypair);

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
      metadataUri,
      metadata
    };

  } catch (error: any) {
    console.error('Error minting NFT certificate:', error);
    throw new Error(`Failed to mint NFT certificate: ${error.message}`);
  }
}

/**
 * Get NFT certificate information by reading and deserializing the real
 * on-chain Metaplex metadata account, then resolving the off-chain JSON at
 * its `uri` for the fields (description/attributes/image) that don't live
 * on-chain. Returns null only when the account genuinely doesn't exist or
 * can't be read - not as a placeholder.
 */
export async function getNFTCertificate(mintAddress: string): Promise<NFTMetadata | null> {
  try {
    const mint = new PublicKey(mintAddress);
    const [metadataAddress] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('metadata'),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        mint.toBuffer(),
      ],
      TOKEN_METADATA_PROGRAM_ID
    );

    const metadataAccount = await connection.getAccountInfo(metadataAddress);
    if (!metadataAccount) {
      return null;
    }

    // The on-chain account only stores name/symbol/uri directly (plus
    // royalty/creator info) - the full description/attributes/image live
    // in the JSON document at `uri`, which mintNFTCertificate wrote as a
    // data: URI, so it's fetchable directly with no external storage.
    const onChainMetadata = Metadata.fromAccountInfo(metadataAccount)[0];
    const uri = onChainMetadata.data.uri?.trim().replace(/\0/g, '');
    if (!uri) {
      return null;
    }

    const response = await fetch(uri);
    if (!response.ok) {
      throw new Error(`Failed to fetch metadata JSON at ${uri}: ${response.status}`);
    }

    return await response.json() as NFTMetadata;

  } catch (error) {
    console.error('Error fetching NFT certificate:', error);
    return null;
  }
}

/**
 * Reconstruct the full NFTCertificate shape (mint/metadata/token addresses
 * plus resolved off-chain metadata) for a certificate that was minted in a
 * previous session. metadataAddress and tokenAddress are both deterministic
 * PDAs/ATAs derived from the mint, so there's nothing to store for them
 * beyond the mint address itself - only genuinely re-fetching the metadata
 * JSON requires a network call.
 */
export async function resolveNFTCertificate(
  mintAddress: string,
  ownerWallet: string,
  txSignature: string,
  metadataUri: string
): Promise<NFTCertificate | null> {
  const metadata = await getNFTCertificate(mintAddress);
  if (!metadata) {
    return null;
  }

  const mint = new PublicKey(mintAddress);
  const [metadataAddress] = PublicKey.findProgramAddressSync(
    [
      Buffer.from('metadata'),
      TOKEN_METADATA_PROGRAM_ID.toBuffer(),
      mint.toBuffer(),
    ],
    TOKEN_METADATA_PROGRAM_ID
  );
  const tokenAddress = await getAssociatedTokenAddress(mint, new PublicKey(ownerWallet));

  return {
    mintAddress,
    metadataAddress: metadataAddress.toString(),
    tokenAddress: tokenAddress.toString(),
    txSignature,
    metadataUri,
    metadata,
  };
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