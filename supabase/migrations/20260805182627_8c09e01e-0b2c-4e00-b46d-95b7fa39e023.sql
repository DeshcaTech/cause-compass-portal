CREATE TABLE public.footer_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  photo_url text NOT NULL,
  caption text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.footer_photos TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.footer_photos TO authenticated;
GRANT ALL ON public.footer_photos TO service_role;

ALTER TABLE public.footer_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Footer photos are viewable by everyone"
  ON public.footer_photos FOR SELECT USING (true);

CREATE POLICY "Content admins manage footer photos"
  ON public.footer_photos FOR ALL TO authenticated
  USING (public.can_edit_content(auth.uid()))
  WITH CHECK (public.can_edit_content(auth.uid()));

CREATE OR REPLACE FUNCTION public.enforce_footer_photo_limit()
RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public' AS $$
DECLARE _count integer;
BEGIN
  SELECT count(*) INTO _count FROM public.footer_photos;
  IF _count >= 10 THEN
    RAISE EXCEPTION 'You can store at most 10 footer photos. Remove one first.';
  END IF;
  RETURN NEW;
END; $$;

REVOKE EXECUTE ON FUNCTION public.enforce_footer_photo_limit() FROM PUBLIC;

CREATE TRIGGER footer_photos_limit
  BEFORE INSERT ON public.footer_photos
  FOR EACH ROW EXECUTE FUNCTION public.enforce_footer_photo_limit();

CREATE TRIGGER footer_photos_updated
  BEFORE UPDATE ON public.footer_photos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER audit_footer_photos
  AFTER INSERT OR UPDATE OR DELETE ON public.footer_photos
  FOR EACH ROW EXECUTE FUNCTION public.record_audit_event();