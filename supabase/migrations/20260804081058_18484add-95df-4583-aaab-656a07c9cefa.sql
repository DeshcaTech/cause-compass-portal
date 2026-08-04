CREATE TABLE public.event_rsvps (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  membership_number text,
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  guests integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'going',
  note text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT INSERT ON public.event_rsvps TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.event_rsvps TO authenticated;
GRANT ALL ON public.event_rsvps TO service_role;

ALTER TABLE public.event_rsvps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit an rsvp"
ON public.event_rsvps FOR INSERT TO anon, authenticated
WITH CHECK (
  length(btrim(full_name)) BETWEEN 2 AND 120
  AND length(email) <= 255
  AND email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  AND (phone IS NULL OR length(phone) <= 30)
  AND (membership_number IS NULL OR length(membership_number) <= 30)
  AND (note IS NULL OR length(note) <= 500)
  AND guests BETWEEN 0 AND 20
  AND status IN ('going', 'interested')
  AND (user_id IS NULL OR user_id = auth.uid())
);

CREATE POLICY "Managers can read rsvps"
ON public.event_rsvps FOR SELECT TO authenticated
USING (public.can_manage(auth.uid(), 'event') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Managers can update rsvps"
ON public.event_rsvps FOR UPDATE TO authenticated
USING (public.can_manage(auth.uid(), 'event') OR public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.can_manage(auth.uid(), 'event') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Managers can delete rsvps"
ON public.event_rsvps FOR DELETE TO authenticated
USING (public.can_manage(auth.uid(), 'event') OR public.has_role(auth.uid(), 'admin'));

CREATE INDEX event_rsvps_event_id_idx ON public.event_rsvps(event_id);