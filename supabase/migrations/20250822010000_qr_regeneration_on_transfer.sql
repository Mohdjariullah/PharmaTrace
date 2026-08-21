/*
  # QR code regeneration on transfer

  A batch's QR code is issued once at registration. When ownership moves
  (transferBatch), the physical/displayed QR should be replaced: the old
  code becomes outdated and a new one, tied to the transfer transaction and
  the new owner, becomes the one anyone should actually be scanning.

  This is a distinct concept from `is_consumed` (a genuine end-consumer scan
  of the *current* QR, used to detect resale/counterfeit reuse) - a batch
  that has simply changed distributor hands has not been consumed by
  anyone, but its old QR code is no longer the one that should be trusted.
  Reusing `is_consumed` for this would falsely trigger the "already
  verified, may be counterfeit" warning on a batch that was legitimately
  transferred and never actually scanned by an end consumer.

  `is_current` marks which qr_codes row is the authoritative one for a
  batch at any point in time. Exactly one row per batch_id should have
  is_current = true once regeneration is wired up in the app.
*/

ALTER TABLE public.qr_codes
  ADD COLUMN IF NOT EXISTS is_current boolean NOT NULL DEFAULT true;

CREATE INDEX IF NOT EXISTS qr_codes_batch_id_current_idx
  ON public.qr_codes (batch_id, is_current);
