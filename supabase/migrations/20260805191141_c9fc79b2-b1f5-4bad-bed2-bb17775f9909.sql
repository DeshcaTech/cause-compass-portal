CREATE OR REPLACE FUNCTION public.enforce_footer_photo_limit()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
DECLARE _count integer;
BEGIN
  SELECT count(*) INTO _count FROM public.footer_photos;
  IF _count >= 100 THEN
    RAISE EXCEPTION 'You can store at most 100 footer photos. Remove one first.';
  END IF;
  RETURN NEW;
END; $$;