CREATE TABLE public.brand_settings (
  id smallint PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  logo_url text,
  og_image_url text,
  show_logo_header boolean NOT NULL DEFAULT true,
  show_logo_footer boolean NOT NULL DEFAULT true,
  use_logo_favicon boolean NOT NULL DEFAULT true,
  primary_color text NOT NULL DEFAULT '#064e3b',
  accent_color text NOT NULL DEFAULT '#c9a84c',
  heading_font text NOT NULL DEFAULT 'Outfit',
  body_font text NOT NULL DEFAULT 'Figtree',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT ON public.brand_settings TO anon;
GRANT SELECT ON public.brand_settings TO authenticated;
GRANT INSERT, UPDATE ON public.brand_settings TO authenticated;
GRANT ALL ON public.brand_settings TO service_role;

ALTER TABLE public.brand_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Brand settings are viewable by everyone"
  ON public.brand_settings FOR SELECT USING (true);

CREATE POLICY "Admins can insert brand settings"
  ON public.brand_settings FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update brand settings"
  ON public.brand_settings FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER brand_settings_updated
  BEFORE UPDATE ON public.brand_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.brand_settings (id) VALUES (1);