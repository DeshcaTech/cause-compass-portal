REVOKE SELECT ON public.events FROM anon;
GRANT SELECT (id, title, description, start_at, end_at, location, image_url, event_type, organiser, ticket_url, created_at) ON public.events TO anon;

REVOKE SELECT ON public.jobs FROM anon;
GRANT SELECT (id, title, company, category, job_type, location, salary_range, short_description, description, image_url, apply_url, contact_email, contact_phone, closes_at, is_published, approval_status, reviewed_at, created_at) ON public.jobs TO anon;