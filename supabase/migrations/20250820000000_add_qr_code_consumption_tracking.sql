/*
  # Add QR code consumption tracking columns

  1. Changes
    - Add `is_consumed` and `consumed_at` to `public.qr_codes`
      (services/supabaseService.ts's markQrCodeAsConsumed() and
      app/verify/page.tsx already read/write these columns, but the
      original qr_codes migration never defined them, so every QR
      verification failed with "column does not exist").

  2. Notes
    - `is_consumed` defaults to false for existing/new rows.
    - Index added on `is_consumed` for the consumption-guard update
      used to avoid double-consuming a QR code under concurrent scans.
*/

ALTER TABLE public.qr_codes
  ADD COLUMN IF NOT EXISTS is_consumed boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS consumed_at timestamp with time zone;

CREATE INDEX IF NOT EXISTS idx_qr_codes_is_consumed ON public.qr_codes(is_consumed);
