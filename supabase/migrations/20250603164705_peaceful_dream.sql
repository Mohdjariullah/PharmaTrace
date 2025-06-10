/*
  # Initial schema for PharmaTrace

  1. New Tables
    - `batches`
      - Stores all pharmaceutical batches with their metadata
      - Links to blockchain with batch_pda and transaction signature
    - `batch_transfers`
      - Records ownership transfers between wallets
      - References batches via batch_id
    - `batch_flags`
      - Records suspicious batches flagged by regulators
      - References batches via batch_id

  2. Security
    - Enable RLS on all tables
    - Create policies for authenticated users
*/

-- Enable UUIDs extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: public.batches
CREATE TABLE IF NOT EXISTS public.batches (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  batch_id text UNIQUE NOT NULL,
  product_name text NOT NULL,
  manufacturer_wallet text NOT NULL,
  current_owner_wallet text NOT NULL,
  mfg_date date NOT NULL,
  exp_date date NOT NULL,
  status integer NOT NULL DEFAULT 0, -- 0=Valid, 1=Flagged, 2=Expired
  ipfs_hash text,
  batch_pda text NOT NULL,
  init_tx_signature text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Table: public.batch_transfers
CREATE TABLE IF NOT EXISTS public.batch_transfers (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  batch_id text NOT NULL REFERENCES public.batches(batch_id) ON DELETE CASCADE,
  from_wallet text NOT NULL,
  to_wallet text NOT NULL,
  tx_signature text NOT NULL,
  transfer_date timestamp with time zone DEFAULT now()
);

-- Table: public.batch_flags
CREATE TABLE IF NOT EXISTS public.batch_flags (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  batch_id text NOT NULL REFERENCES public.batches(batch_id) ON DELETE CASCADE,
  flagged_by_wallet text NOT NULL,
  reason text NOT NULL,
  tx_signature text NOT NULL,
  flagged_at timestamp with time zone DEFAULT now()
);

-- Table: public.roles
CREATE TABLE IF NOT EXISTS public.roles (
  wallet_address text PRIMARY KEY,
  role text NOT NULL DEFAULT 'user', -- 'user', 'manufacturer', 'regulator'
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batch_transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batch_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Batches policies
CREATE POLICY "Anyone can read batches"
  ON public.batches
  FOR SELECT
  USING (true);

-- In a real app, verify wallet signatures or use auth
CREATE POLICY "Anyone can insert batches"
  ON public.batches
  FOR INSERT
  WITH CHECK (true);

-- Only current owner can update batch
CREATE POLICY "Only current owner can update batch"
  ON public.batches
  FOR UPDATE
  USING (auth.uid()::text = current_owner_wallet);

-- Transfers policies
CREATE POLICY "Anyone can read transfers"
  ON public.batch_transfers
  FOR SELECT
  USING (true);

-- In a real app, verify wallet signatures or use auth
CREATE POLICY "Anyone can insert transfers"
  ON public.batch_transfers
  FOR INSERT
  WITH CHECK (true);

-- Flags policies
CREATE POLICY "Anyone can read flags"
  ON public.batch_flags
  FOR SELECT
  USING (true);

-- In a real app, verify that flagger has regulator role
CREATE POLICY "Anyone can insert flags"
  ON public.batch_flags
  FOR INSERT
  WITH CHECK (true);

-- Roles policies
CREATE POLICY "Anyone can read roles"
  ON public.roles
  FOR SELECT
  USING (true);

-- In a real app, restrict role management to admins
CREATE POLICY "Anyone can manage roles"
  ON public.roles
  FOR ALL
  USING (true);