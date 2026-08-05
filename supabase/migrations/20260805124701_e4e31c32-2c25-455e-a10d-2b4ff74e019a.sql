
CREATE TABLE public.site_settings (
  id smallint PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  org_name text NOT NULL DEFAULT 'CCGMs',
  hero_eyebrow text NOT NULL DEFAULT 'Cameroonian Community in Greater Manchester and Surrounding area',
  hero_title_line1 text NOT NULL DEFAULT 'Stronger together,',
  hero_title_line2 text NOT NULL DEFAULT 'generation after generation',
  hero_intro text NOT NULL DEFAULT 'CCGMs is built on family, culture and mutual support. Join us, give to a cause, and be part of everything we build together.',
  about_eyebrow text NOT NULL DEFAULT 'Who we are',
  about_title text NOT NULL DEFAULT 'A family of families',
  about_body_1 text NOT NULL DEFAULT 'CCGMs brings together members of our community across generations — parents, students, elders and children — around culture, faith, friendship and mutual support.',
  about_body_2 text NOT NULL DEFAULT 'We celebrate together, raise funds for causes that matter to our members, promote businesses run by our community, and stand beside anyone who needs a hand.',
  android_app_url text,
  ios_app_url text,
  contact_address text NOT NULL DEFAULT 'CCGMs Centre, 24 Unity Road',
  contact_phone text NOT NULL DEFAULT '07700 900000',
  contact_email text NOT NULL DEFAULT 'hello@ccgms.org',
  footer_blurb text NOT NULL DEFAULT 'A community association bringing families together — supporting one another, celebrating our culture and building a stronger future for the next generation.',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.site_settings TO anon;
GRANT SELECT, INSERT, UPDATE ON public.site_settings TO authenticated;
GRANT ALL ON public.site_settings TO service_role;

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read site settings" ON public.site_settings
  FOR SELECT USING (true);
CREATE POLICY "admins insert site settings" ON public.site_settings
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins update site settings" ON public.site_settings
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER site_settings_updated BEFORE UPDATE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.site_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.documents TO authenticated;
GRANT ALL ON public.documents TO service_role;

CREATE POLICY "admins insert documents" ON public.documents
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins update documents" ON public.documents
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins delete documents" ON public.documents
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
