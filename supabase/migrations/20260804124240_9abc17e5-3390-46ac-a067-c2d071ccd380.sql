CREATE TABLE public.village_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  region text NOT NULL DEFAULT 'General',
  short_description text,
  description text,
  image_url text,
  meeting_info text,
  contact_name text,
  contact_phone text,
  contact_email text,
  is_published boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.village_groups TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.village_groups TO authenticated;
GRANT ALL ON public.village_groups TO service_role;

ALTER TABLE public.village_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published village groups"
ON public.village_groups FOR SELECT TO anon, authenticated
USING (is_published = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert village groups"
ON public.village_groups FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update village groups"
ON public.village_groups FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete village groups"
ON public.village_groups FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.village_groups (name, region, short_description, description, meeting_info, contact_name, contact_phone, contact_email, sort_order) VALUES
('Bamenda Family Manchester', 'North West Region', 'Sons and daughters of Bamenda living across Greater Manchester.', 'A village-based group bringing together families from Bamenda and its surroundings. The group runs monthly meetings, a savings circle and supports members during bereavements, births and weddings.', 'Second Saturday of every month, 4pm — Longsight Community Centre', 'Ngwa Emmanuel', '+44 7700 900123', 'bamenda@ccgme.org.uk', 1),
('Bafoussam Union UK', 'West Region', 'Bringing together families from Bafoussam and the Mifi division.', 'The Bafoussam Union gathers members from Bafoussam and neighbouring villages. Activities include cultural evenings, a mutual aid fund and youth mentoring for students in Greater Manchester.', 'Last Sunday of every month, 3pm — Salford Civic Centre', 'Tchoua Marie', '+44 7700 900456', 'bafoussam@ccgme.org.uk', 2),
('Buea & Fako Association', 'South West Region', 'Members from Buea, Limbe and the wider Fako division.', 'A welcoming group for families originally from Fako division. The association organises an annual picnic, supports new arrivals with settling in, and coordinates community fundraising.', 'First Saturday of every quarter, 2pm — Moss Side Powerhouse', 'Ekema Daniel', '+44 7700 900789', 'fako@ccgme.org.uk', 3);