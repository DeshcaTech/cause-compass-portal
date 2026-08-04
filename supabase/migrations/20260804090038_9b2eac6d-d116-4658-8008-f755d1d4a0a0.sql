ALTER TABLE public.jobs
  ADD COLUMN IF NOT EXISTS approval_status text NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS reviewed_at timestamptz;

ALTER TABLE public.jobs
  ADD CONSTRAINT jobs_approval_status_check CHECK (approval_status IN ('pending','approved','rejected'));

UPDATE public.jobs SET approval_status = 'approved', reviewed_at = now();

DROP POLICY IF EXISTS "Published jobs are viewable by everyone" ON public.jobs;
CREATE POLICY "Published jobs are viewable by everyone"
  ON public.jobs FOR SELECT
  USING (is_published = true AND approval_status = 'approved');

CREATE TABLE public.job_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  membership_number text,
  message text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.job_applications TO authenticated;
GRANT INSERT ON public.job_applications TO anon, authenticated;
GRANT ALL ON public.job_applications TO service_role;

ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can send a job enquiry"
  ON public.job_applications FOR INSERT
  WITH CHECK (
    length(trim(full_name)) BETWEEN 2 AND 120
    AND email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    AND length(email) <= 255
    AND (phone IS NULL OR length(phone) <= 30)
    AND (membership_number IS NULL OR length(membership_number) <= 40)
    AND (message IS NULL OR length(message) <= 2000)
    AND EXISTS (
      SELECT 1 FROM public.jobs j
      WHERE j.id = job_id AND j.is_published AND j.approval_status = 'approved'
    )
  );

CREATE POLICY "Admins view job enquiries"
  ON public.job_applications FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX job_applications_job_id_idx ON public.job_applications (job_id, created_at DESC);