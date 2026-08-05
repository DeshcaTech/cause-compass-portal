DROP POLICY "Anyone can view published village groups" ON public.village_groups;
CREATE POLICY "public read village groups" ON public.village_groups FOR SELECT TO anon, authenticated USING (is_published = true);
CREATE POLICY "admins read all village groups" ON public.village_groups FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));