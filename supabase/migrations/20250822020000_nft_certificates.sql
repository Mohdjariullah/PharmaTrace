/*
  # NFT certificates table

  services/nftService.ts has always been able to mint a real on-chain NFT
  certificate for a batch, but nothing ever recorded that it happened - the
  minted certificate lived only in the verify page's component state, gone
  on the next reload or for any other viewer, even though the NFT itself
  exists permanently on-chain. This table is the missing link: one row per
  minted certificate, looked up by batch so the verify page can show an
  already-minted certificate instead of always offering to mint a new one.

  RLS mirrors the batches/qr_codes tables already in this schema: open
  read/insert, no auth.uid() gate, since this app has no Supabase Auth
  session to gate on (see the batches UPDATE policy fix from
  20250822000000 - the same auth.uid() mistake, made once, isn't worth
  repeating here).
*/

CREATE TABLE IF NOT EXISTS public.nft_certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id text NOT NULL REFERENCES public.batches(batch_id) ON DELETE CASCADE,
  mint_address text NOT NULL UNIQUE,
  metadata_uri text NOT NULL,
  owner_wallet text NOT NULL,
  tx_signature text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

CREATE INDEX IF NOT EXISTS nft_certificates_batch_id_idx ON public.nft_certificates (batch_id);

ALTER TABLE public.nft_certificates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read NFT certificates"
  ON public.nft_certificates
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert NFT certificates"
  ON public.nft_certificates
  FOR INSERT
  WITH CHECK (true);
