ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS tiktok_url text;
GRANT SELECT, UPDATE ON public.site_settings TO authenticated;
GRANT ALL ON public.site_settings TO service_role;