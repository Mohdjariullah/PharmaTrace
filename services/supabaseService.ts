import { supabase } from '@/lib/supabaseClient';
import { Batch, BatchTransfer, BatchFlag, QrCode } from '@/types';

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