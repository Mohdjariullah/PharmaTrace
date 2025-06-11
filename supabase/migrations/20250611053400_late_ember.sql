/*
  # Create QR codes table for storing QR code data

  1. New Tables
    - `qr_codes`
      - Stores QR code data with transaction hash, batch ID, and medicine name
      - Links to batches table via batch_id

  2. Security
    - Enable RLS on qr_codes table
    - Add policies for public read access
*/

-- Table: public.qr_codes
CREATE TABLE IF NOT EXISTS public.qr_codes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  tx_signature text UNIQUE NOT NULL,
  batch_id text NOT NULL REFERENCES public.batches(batch_id) ON DELETE CASCADE,
  medicine_name text NOT NULL,
  owner_address text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.qr_codes ENABLE ROW LEVEL SECURITY;

-- Create policies for QR codes
CREATE POLICY "Anyone can read QR codes"
  ON public.qr_codes
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert QR codes"
  ON public.qr_codes
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update QR codes"
  ON public.qr_codes
  FOR UPDATE
  USING (true);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_qr_codes_tx_signature ON public.qr_codes(tx_signature);
CREATE INDEX IF NOT EXISTS idx_qr_codes_batch_id ON public.qr_codes(batch_id);