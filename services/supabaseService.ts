import { supabase } from '@/lib/supabaseClient';
import { Batch, BatchTransfer, BatchFlag } from '@/types';

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

  if (error) throw error;
  return data;
}

export async function getBatchByTxSignature(txSignature: string) {
  const { data, error } = await supabase
    .from('batches')
    .select('*')
    .eq('init_tx_signature', txSignature)
    .single();

  if (error) throw error;
  return data;
}

export async function getBatchByPDA(batchPDA: string) {
  const { data, error } = await supabase
    .from('batches')
    .select('*')
    .eq('batch_pda', batchPDA)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows found
      return null;
    }
    throw error;
  }
  return data;
}

export async function getBatchById(batchId: string) {
  const { data, error } = await supabase
    .from('batches')
    .select('*')
    .eq('batch_id', batchId)
    .single();

  if (error) throw error;
  return data;
}

export async function updateBatchOwner(batchId: string, newOwnerWallet: string) {
  const { data, error } = await supabase
    .from('batches')
    .update({ 
      current_owner_wallet: newOwnerWallet,
      updated_at: new Date().toISOString()
    })
    .eq('batch_id', batchId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateBatchStatus(batchId: string, status: 0 | 1 | 2) {
  const { data, error } = await supabase
    .from('batches')
    .update({ 
      status,
      updated_at: new Date().toISOString()
    })
    .eq('batch_id', batchId)
    .select()
    .single();

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