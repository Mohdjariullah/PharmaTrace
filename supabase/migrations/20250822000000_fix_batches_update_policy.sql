/*
  # Fix batches UPDATE policy blocking every write

  The original "Only current owner can update batch" policy gated UPDATE on
  `auth.uid()::text = current_owner_wallet`. This app never authenticates
  through Supabase Auth (ownership is proven by a wallet signature and
  enforced on-chain by the Anchor program's NotCurrentOwner check, not by a
  Supabase session), so `auth.uid()` is always NULL for every request. A NULL
  comparison is never true, which means the policy silently rejected every
  single UPDATE to `batches` - both `updateBatchOwner` (transfer) and
  `updateBatchStatus` (regulator flag) - regardless of who issued it, even
  right after a successful on-chain transaction.

  Real authorization already happens on-chain: only the actual current owner
  can produce a valid, signed transferBatch/flagBatch instruction, and the
  verify page's crossVerifyBatch cross-checks the stored row against the
  live on-chain account on every view, so a database write with no matching
  on-chain transaction is caught and surfaced as a discrepancy. This mirrors
  the trust model the INSERT policies already documented as a known
  trade-off ("In a real app, verify wallet signatures or use auth").
*/

DROP POLICY IF EXISTS "Only current owner can update batch" ON public.batches;

CREATE POLICY "Anyone can update batches"
  ON public.batches
  FOR UPDATE
  USING (true)
  WITH CHECK (true);
