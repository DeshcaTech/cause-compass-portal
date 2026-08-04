-- 1. Internal SECURITY DEFINER helper should not be callable from the API
REVOKE EXECUTE ON FUNCTION public.can_manage(uuid, text) FROM anon, authenticated;

-- 2. site-images: remove blanket anon/authenticated read; signed URLs bypass RLS
DROP POLICY IF EXISTS "Signed reads of site images" ON storage.objects;
CREATE POLICY "Admins read site images"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'site-images' AND public.has_role(auth.uid(), 'admin'));

-- 3. job-cvs: uploads must be scoped to an existing, open job advert
DROP POLICY IF EXISTS "Anyone can upload a CV" ON storage.objects;
CREATE POLICY "CV uploads scoped to an open job"
ON storage.objects FOR INSERT TO anon, authenticated
WITH CHECK (
  bucket_id = 'job-cvs'
  AND array_length(storage.foldername(name), 1) = 1
  AND (storage.foldername(name))[1] ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
  AND lower(storage.extension(name)) IN ('pdf', 'doc', 'docx')
  AND EXISTS (
    SELECT 1 FROM public.jobs j
    WHERE j.id = ((storage.foldername(name))[1])::uuid
      AND j.is_published
      AND j.approval_status = 'approved'
      AND (j.closes_at IS NULL OR j.closes_at >= current_date)
  )
);