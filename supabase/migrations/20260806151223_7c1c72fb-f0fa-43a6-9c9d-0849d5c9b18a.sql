DROP POLICY IF EXISTS "admins manage events" ON public.events;

CREATE POLICY "admins manage events select" ON public.events
FOR SELECT TO authenticated
USING (public.can_edit_content(auth.uid()));

CREATE POLICY "admins insert events" ON public.events
FOR INSERT TO authenticated
WITH CHECK (
  public.can_edit_content(auth.uid())
  AND (event_type <> 'ccgms'::public.event_type OR public.is_admin(auth.uid()))
);

CREATE POLICY "admins update events" ON public.events
FOR UPDATE TO authenticated
USING (
  public.can_edit_content(auth.uid())
  AND (event_type <> 'ccgms'::public.event_type OR public.is_admin(auth.uid()))
)
WITH CHECK (
  public.can_edit_content(auth.uid())
  AND (event_type <> 'ccgms'::public.event_type OR public.is_admin(auth.uid()))
);

CREATE POLICY "admins delete events" ON public.events
FOR DELETE TO authenticated
USING (
  public.can_edit_content(auth.uid())
  AND (event_type <> 'ccgms'::public.event_type OR public.is_admin(auth.uid()))
);