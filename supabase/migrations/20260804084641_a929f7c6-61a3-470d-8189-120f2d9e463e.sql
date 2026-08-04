REVOKE SELECT ON public.events FROM anon, authenticated;
GRANT SELECT (id, title, description, start_at, end_at, location, image_url, event_type, organiser, ticket_url, created_at) ON public.events TO anon, authenticated;
GRANT ALL ON public.events TO service_role;