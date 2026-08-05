DROP POLICY IF EXISTS "Members and admins can read announcements" ON public.announcements;
CREATE POLICY "Members and admins can read announcements"
ON public.announcements FOR SELECT TO authenticated
USING (is_published = true OR public.can_edit_content(auth.uid()));