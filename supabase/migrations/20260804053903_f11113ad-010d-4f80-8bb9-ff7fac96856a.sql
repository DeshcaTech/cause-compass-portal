CREATE TABLE public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  summary text,
  body text,
  image_url text,
  is_published boolean not null default true,
  published_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
GRANT SELECT ON public.announcements TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.announcements TO authenticated;
GRANT ALL ON public.announcements TO service_role;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read published announcements" ON public.announcements FOR SELECT USING (is_published = true OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage announcements" ON public.announcements FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.get_home_stats()
RETURNS json
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT json_build_object(
    'members', (SELECT count(*) FROM public.memberships WHERE status <> 'cancelled')
      + (SELECT count(*) FROM public.membership_family_members),
    'businesses', (SELECT count(*) FROM public.partners WHERE is_published),
    'upcoming_events', (SELECT count(*) FROM public.events WHERE start_at >= now()),
    'board_members', (SELECT count(*) FROM public.board_members WHERE is_current),
    'active_campaigns', (SELECT count(*) FROM public.campaigns WHERE status = 'active')
  );
$$;
REVOKE ALL ON FUNCTION public.get_home_stats() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_home_stats() TO anon, authenticated, service_role;