CREATE TABLE public.jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  company text NOT NULL,
  category text NOT NULL DEFAULT 'General',
  job_type text NOT NULL DEFAULT 'Full-time',
  location text,
  salary_range text,
  short_description text,
  description text,
  image_url text,
  apply_url text,
  contact_email text,
  contact_phone text,
  closes_at date,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT (id, title, company, category, job_type, location, salary_range, short_description, description, image_url, apply_url, closes_at, is_published, created_at) ON public.jobs TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.jobs TO authenticated;
GRANT ALL ON public.jobs TO service_role;

ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published jobs are viewable by everyone"
ON public.jobs FOR SELECT
USING (is_published = true);

CREATE POLICY "Admins manage jobs"
ON public.jobs FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));