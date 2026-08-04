DROP POLICY IF EXISTS "Anyone can read published announcements" ON public.announcements;

CREATE POLICY "Public can read published announcements"
ON public.announcements FOR SELECT TO anon
USING (is_published = true);

CREATE POLICY "Members and admins can read announcements"
ON public.announcements FOR SELECT TO authenticated
USING (is_published = true OR public.has_role(auth.uid(), 'admin'));

GRANT SELECT ON public.announcements TO anon;
GRANT SELECT ON public.announcements TO authenticated;