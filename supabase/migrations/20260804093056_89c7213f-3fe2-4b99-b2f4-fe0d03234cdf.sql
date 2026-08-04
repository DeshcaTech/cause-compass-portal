ALTER TABLE public.jobs
  ADD COLUMN IF NOT EXISTS notify_email text,
  ADD COLUMN IF NOT EXISTS notify_whatsapp text;