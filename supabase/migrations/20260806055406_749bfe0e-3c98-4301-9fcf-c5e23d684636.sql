ALTER TABLE public.partners ADD COLUMN IF NOT EXISTS whatsapp text;
GRANT SELECT (whatsapp) ON public.partners TO anon;
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS status_notified_at timestamptz;