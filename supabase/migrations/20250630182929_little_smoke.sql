/*
  # Create audit events table for comprehensive logging

  1. New Tables
    - `audit_events`
      - Stores all system events with detailed metadata
      - Supports different event types and severity levels
      - Links to batches and users for comprehensive tracking

  2. Security
    - Enable RLS on audit_events table
    - Add policies for read access
*/

-- Table: public.audit_events
CREATE TABLE IF NOT EXISTS public.audit_events (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type text NOT NULL CHECK (event_type IN ('batch_registered', 'batch_transferred', 'batch_flagged', 'batch_verified', 'nft_minted', 'qr_scanned')),
  batch_id text REFERENCES public.batches(batch_id) ON DELETE SET NULL,
  user_wallet text NOT NULL,
  transaction_signature text,
  metadata jsonb NOT NULL DEFAULT '{}',
  ip_address inet,
  user_agent text,
  timestamp timestamp with time zone NOT NULL DEFAULT now(),
  severity text NOT NULL DEFAULT 'low' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  created_at timestamp with time zone DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.audit_events ENABLE ROW LEVEL SECURITY;

-- Create policies for audit events
CREATE POLICY "Anyone can read audit events"
  ON public.audit_events
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert audit events"
  ON public.audit_events
  FOR INSERT
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_audit_events_event_type ON public.audit_events(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_events_batch_id ON public.audit_events(batch_id);
CREATE INDEX IF NOT EXISTS idx_audit_events_user_wallet ON public.audit_events(user_wallet);
CREATE INDEX IF NOT EXISTS idx_audit_events_timestamp ON public.audit_events(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_events_severity ON public.audit_events(severity);
CREATE INDEX IF NOT EXISTS idx_audit_events_transaction ON public.audit_events(transaction_signature);

-- Create composite index for common queries
CREATE INDEX IF NOT EXISTS idx_audit_events_batch_timestamp ON public.audit_events(batch_id, timestamp DESC);