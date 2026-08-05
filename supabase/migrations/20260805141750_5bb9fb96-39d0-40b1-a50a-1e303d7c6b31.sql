CREATE OR REPLACE FUNCTION public.enforce_single_default_gallery()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.is_default THEN
    UPDATE public.galleries SET is_default = false WHERE id <> NEW.id AND is_default;
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS galleries_single_default ON public.galleries;
CREATE TRIGGER galleries_single_default
AFTER INSERT OR UPDATE OF is_default ON public.galleries
FOR EACH ROW WHEN (NEW.is_default) EXECUTE FUNCTION public.enforce_single_default_gallery();