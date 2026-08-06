ALTER TABLE public.events ADD COLUMN IF NOT EXISTS fee numeric NOT NULL DEFAULT 0;
ALTER TABLE public.events ADD CONSTRAINT events_fee_non_negative CHECK (fee >= 0);
GRANT SELECT (fee) ON public.events TO anon;