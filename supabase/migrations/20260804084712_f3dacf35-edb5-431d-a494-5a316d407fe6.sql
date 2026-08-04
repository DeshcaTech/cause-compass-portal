ALTER TABLE public.events DROP COLUMN IF EXISTS report_token;
REVOKE SELECT ON public.events FROM anon, authenticated;
GRANT SELECT (id, title, description, start_at, end_at, location, image_url, event_type, organiser, ticket_url, created_at) ON public.events TO anon;
GRANT SELECT ON public.events TO authenticated;
GRANT ALL ON public.events TO service_role;