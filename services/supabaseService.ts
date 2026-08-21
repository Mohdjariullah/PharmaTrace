import { supabase } from '@/lib/supabaseClient';
import { Batch, BatchTransfer, BatchFlag, QrCode, NFTCertificate } from '@/types';

// Batch methods
export async function insertBatchMetadata(batch: Omit<Batch, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('batches')
    .insert({
      ...batch,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      // Unique constraint violation
      throw new Error(`Batch with ID "${batch.batch_id}" already exists. Please use a different batch ID.`);
    }
    throw error;
  }
  return data;
}

export async function getBatchByTxSignature(txSignature: string) {
  const { data, error } = await supabase
    .from('batches')
    .select('*')
    .eq('init_tx_signature', txSignature)
    .maybeSingle(); // Use maybeSingle() instead of single()

  if (error) {
    throw error;
  }
  return data; // Will be null if no rows found
}

export async function getBatchByPDA(batchPDA: string) {
  const { data, error } = await supabase
    .from('batches')
    .select('*')
    .eq('batch_pda', batchPDA)
    .maybeSingle(); // Use maybeSingle() instead of single()

  if (error) {
    throw error;
  }
  return data; // Will be null if no rows found
}

export async function getBatchById(batchId: string) {
  const { data, error } = await supabase
    .from('batches')
    .select('*')
    .eq('batch_id', batchId)
    .maybeSingle(); // Use maybeSingle() instead of single()

  if (error) {
    throw error;
  }
  return data; // Will be null if no rows found
}

export async function updateBatchOwner(batchId: string, newOwnerWallet: string) {
  // First check if the batch exists
  const existingBatch = await getBatchById(batchId);
  if (!existingBatch) {
    throw new Error(`Batch with ID "${batchId}" not found. Please verify the batch ID and try again.`);
  }

  const { data, error } = await supabase
    .from('batches')
    .update({ 
      current_owner_wallet: newOwnerWallet,
      updated_at: new Date().toISOString()
    })
    .eq('batch_id', batchId)
    .select();

  if (error) throw error;
  
  if (!data || data.length === 0) {
    throw new Error(`Failed to update batch with ID "${batchId}". Please try again.`);
  }
  
  return data[0];
}

export async function updateBatchStatus(batchId: string, status: 0 | 1 | 2) {
  // First check if the batch exists
  const existingBatch = await getBatchById(batchId);
  if (!existingBatch) {
    throw new Error(`Batch with ID "${batchId}" not found. Please verify the batch ID and try again.`);
  }

  const { data, error } = await supabase
    .from('batches')
    .update({ 
      status,
      updated_at: new Date().toISOString()
    })
    .eq('batch_id', batchId)
    .select();

  if (error) throw error;
  
  if (!data || data.length === 0) {
    throw new Error(`Failed to update batch status for ID "${batchId}". Please try again.`);
  }
  
  return data[0];
}

// QR Code methods
export async function insertQrCode(qrCode: Omit<QrCode, 'id' | 'created_at' | 'updated_at'>) {
  // Check if QR code with this transaction signature already exists
  const existingQr = await getQrCodeByTxSignature(qrCode.tx_signature);
  if (existingQr) {
    console.log('QR code already exists for this transaction, returning existing one');
    return existingQr;
  }

  const { data, error } = await supabase
    .from('qr_codes')
    .insert({
      ...qrCode,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      // Unique constraint violation - QR code already exists
      console.log('QR code already exists, fetching existing one');
      return await getQrCodeByTxSignature(qrCode.tx_signature);
    }
    throw error;
  }
  return data;
}

export async function getQrCodeByTxSignature(txSignature: string) {
  const { data, error } = await supabase
    .from('qr_codes')
    .select('*')
    .eq('tx_signature', txSignature)
    .maybeSingle(); // Use maybeSingle() instead of single()

  if (error) {
    throw error;
  }
  return data; // Will be null if no rows found
}

export async function getQrCodesByBatch(batchId: string) {
  const { data, error } = await supabase
    .from('qr_codes')
    .select('*')
    .eq('batch_id', batchId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function markQrCodeAsConsumed(txSignature: string) {
  // Guard the update with is_consumed = false so two concurrent scans of the
  // same QR code can't both "win" a check-then-act race; only the first
  // update actually flips the row, and returns it.
  const { data, error } = await supabase
    .from('qr_codes')
    .update({
      is_consumed: true,
      consumed_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('tx_signature', txSignature)
    .eq('is_consumed', false)
    .select();

  if (error) throw error;
  return data && data.length > 0 ? data[0] : null;
}

export async function getCurrentQrCodeForBatch(batchId: string) {
  const { data, error } = await supabase
    .from('qr_codes')
    .select('*')
    .eq('batch_id', batchId)
    .eq('is_current', true)
    .maybeSingle();

  if (error) throw error;
  return data;
}

// Called after a successful on-chain transfer. The old QR (still showing
// the previous owner) is no longer the one anyone should be scanning, so it
// is retired and a fresh one - tied to the transfer transaction and the new
// owner - takes over as the batch's current QR code.
export async function regenerateQrCodeForTransfer(
  batchId: string,
  transferTxSignature: string,
  medicineName: string,
  newOwnerAddress: string
) {
  const { error: retireError } = await supabase
    .from('qr_codes')
    .update({ is_current: false, updated_at: new Date().toISOString() })
    .eq('batch_id', batchId)
    .eq('is_current', true);

  if (retireError) throw retireError;

  return insertQrCode({
    tx_signature: transferTxSignature,
    batch_id: batchId,
    medicine_name: medicineName,
    owner_address: newOwnerAddress,
    is_current: true,
  });
}

// Batch transfers
export async function insertBatchTransfer(transfer: Omit<BatchTransfer, 'id' | 'transfer_date'>) {
  const { data, error } = await supabase
    .from('batch_transfers')
    .insert({
      ...transfer,
      transfer_date: new Date().toISOString()
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getTransfersByBatch(batchId: string) {
  const { data, error } = await supabase
    .from('batch_transfers')
    .select('*')
    .eq('batch_id', batchId)
    .order('transfer_date', { ascending: false });

  if (error) throw error;
  return data;
}

// Batch flags
export async function insertBatchFlag(flag: Omit<BatchFlag, 'id' | 'flagged_at'>) {
  const { data, error } = await supabase
    .from('batch_flags')
    .insert({
      ...flag,
      flagged_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getFlagsByBatch(batchId: string) {
  const { data, error } = await supabase
    .from('batch_flags')
    .select('*')
    .eq('batch_id', batchId)
    .order('flagged_at', { ascending: false });

  if (error) throw error;
  return data;
}

// Transfers where the given wallet is the recipient, newest first - used to
// show "you've been sent a batch" on the dashboard. Purely a read of
// existing transfer history; "seen/dismissed" state lives client-side
// (localStorage) rather than as a new column, so there's nothing to write
// here and no new RLS surface to get wrong.
//
// batch_pda/product_name come along via the batch_transfers.batch_id ->
// batches.batch_id foreign key - a transfer only has the human-readable
// batch_id, but /verify needs the on-chain PDA to look the batch up.
export async function getIncomingTransfersByWallet(walletAddress: string) {
  const { data, error } = await supabase
    .from('batch_transfers')
    .select('*, batches(batch_pda, product_name)')
    .eq('to_wallet', walletAddress)
    .order('transfer_date', { ascending: false });

  if (error) throw error;
  return data as unknown as (BatchTransfer & { batches: { batch_pda: string; product_name: string } | null })[];
}

// NFT certificates
export async function insertNFTCertificate(certificate: Omit<NFTCertificate, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('nft_certificates')
    .insert(certificate)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getNFTCertificateByBatchId(batchId: string) {
  const { data, error } = await supabase
    .from('nft_certificates')
    .select('*')
    .eq('batch_id', batchId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

// Dashboard queries
export async function getBatchesByOwner(ownerWallet: string) {
  const { data, error } = await supabase
    .from('batches')
    .select('*')
    .eq('current_owner_wallet', ownerWallet);

  if (error) throw error;
  return data;
}

export async function getAllBatches(search?: string, status?: number) {
  let query = supabase
    .from('batches')
    .select('*');
  
  if (search) {
    query = query.ilike('product_name', `%${search}%`);
  }
  
  if (status !== undefined) {
    query = query.eq('status', status);
  }
  
  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getBatchStats() {
  // Get total count
  const { count: total, error: totalError } = await supabase
    .from('batches')
    .select('*', { count: 'exact' });

  if (totalError) throw totalError;

  // Get flagged count
  const { count: flagged, error: flaggedError } = await supabase
    .from('batches')
    .select('*', { count: 'exact' })
    .eq('status', 1);

  if (flaggedError) throw flaggedError;

  // Get expired count
  const { count: expired, error: expiredError } = await supabase
    .from('batches')
    .select('*', { count: 'exact' })
    .eq('status', 2);

  if (expiredError) throw expiredError;

  // Get pending transfers by fetching all batches and comparing client-side
  const { data: allBatches, error: batchesError } = await supabase
    .from('batches')
    .select('manufacturer_wallet,current_owner_wallet');

  if (batchesError) throw batchesError;

  const pendingTransfer = allBatches.filter(
    batch => batch.manufacturer_wallet !== batch.current_owner_wallet
  ).length;

  return {
    total: total ?? 0,
    flagged: flagged ?? 0,
    expired: expired ?? 0,
    pendingTransfer
  };
}