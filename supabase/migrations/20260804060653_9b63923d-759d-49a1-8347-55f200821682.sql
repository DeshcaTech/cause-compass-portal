ALTER TABLE public.announcements
  ADD COLUMN IF NOT EXISTS is_featured boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS notified_at timestamptz;

CREATE TABLE IF NOT EXISTS public.news_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  full_name text,
  membership_number text,
  is_active boolean NOT NULL DEFAULT true,
  unsubscribed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.news_subscribers TO authenticated;
GRANT ALL ON public.news_subscribers TO service_role;

ALTER TABLE public.news_subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage news subscribers"
ON public.news_subscribers FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER news_subscribers_updated
BEFORE UPDATE ON public.news_subscribers
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();