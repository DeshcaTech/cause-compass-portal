CREATE TABLE public.analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name text NOT NULL,
  page_path text,
  details jsonb,
  user_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT INSERT ON public.analytics_events TO anon, authenticated;
GRANT SELECT ON public.analytics_events TO authenticated;
GRANT ALL ON public.analytics_events TO service_role;

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can record an analytics event"
  ON public.analytics_events FOR INSERT TO anon, authenticated
  WITH CHECK (char_length(event_name) BETWEEN 1 AND 80
    AND (page_path IS NULL OR char_length(page_path) <= 200));

CREATE POLICY "Admins can view analytics events"
  ON public.analytics_events FOR SELECT TO authenticated
  USING (public.can_edit_content(auth.uid()));

CREATE INDEX analytics_events_name_created_idx ON public.analytics_events (event_name, created_at DESC);