CREATE OR REPLACE FUNCTION public.enforce_footer_photo_limit()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF (SELECT count(*) FROM public.footer_photos) >= 10 THEN
    RAISE EXCEPTION 'You can select at most 10 footer photos.';
  END IF;
  RETURN NEW;
END;
$$;