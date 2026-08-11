ALTER TABLE public.community_assets
  ADD COLUMN IF NOT EXISTS owner_type text NOT NULL DEFAULT 'ccgms',
  ADD COLUMN IF NOT EXISTS owner_name text,
  ADD COLUMN IF NOT EXISTS whatsapp text;

DO $$ BEGIN
  ALTER TABLE public.community_assets
    ADD CONSTRAINT community_assets_owner_type_check CHECK (owner_type IN ('ccgms','partner'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;