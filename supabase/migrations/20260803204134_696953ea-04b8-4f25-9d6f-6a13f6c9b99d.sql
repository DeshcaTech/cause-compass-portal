ALTER TABLE public.surveys ADD COLUMN IF NOT EXISTS image_url text;

-- Admin management policies for content tables
CREATE POLICY "Admins manage board members" ON public.board_members
  FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE POLICY "Admins manage community assets" ON public.community_assets
  FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE POLICY "Admins manage surveys" ON public.surveys
  FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE POLICY "Admins manage president message" ON public.president_message
  FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

GRANT SELECT, INSERT, UPDATE, DELETE ON public.board_members TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.community_assets TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.surveys TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.president_message TO authenticated;

-- Storage policies for the site-images bucket
CREATE POLICY "Signed reads of site images" ON storage.objects
  FOR SELECT TO authenticated, anon USING (bucket_id = 'site-images');

CREATE POLICY "Admins upload site images" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'site-images' AND public.has_role(auth.uid(),'admin'));

CREATE POLICY "Admins update site images" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'site-images' AND public.has_role(auth.uid(),'admin'));

CREATE POLICY "Admins delete site images" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'site-images' AND public.has_role(auth.uid(),'admin'));