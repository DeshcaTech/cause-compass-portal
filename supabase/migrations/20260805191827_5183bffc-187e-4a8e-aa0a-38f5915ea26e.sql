DROP POLICY IF EXISTS "Admins read site images" ON storage.objects;
CREATE POLICY "Admins read site images" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'site-images' AND public.can_edit_content(auth.uid()));

DROP POLICY IF EXISTS "Admins upload site images" ON storage.objects;
CREATE POLICY "Admins upload site images" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'site-images' AND public.can_edit_content(auth.uid()));

DROP POLICY IF EXISTS "Admins update site images" ON storage.objects;
CREATE POLICY "Admins update site images" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'site-images' AND public.can_edit_content(auth.uid()));

DROP POLICY IF EXISTS "Admins delete site images" ON storage.objects;
CREATE POLICY "Admins delete site images" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'site-images' AND public.can_edit_content(auth.uid()));