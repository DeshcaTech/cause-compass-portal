DROP POLICY "Published jobs are viewable by everyone" ON public.jobs;
CREATE POLICY "Published jobs are viewable by everyone" ON public.jobs
FOR SELECT
USING (is_published = true AND approval_status = 'approved' AND (closes_at IS NULL OR closes_at >= CURRENT_DATE));