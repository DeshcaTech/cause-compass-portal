ALTER TABLE public.announcements ADD COLUMN IF NOT EXISTS is_pinned boolean NOT NULL DEFAULT false;

CREATE OR REPLACE FUNCTION public.enforce_pinned_news_limit()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  _count integer;
BEGIN
  IF NEW.is_pinned THEN
    SELECT count(*) INTO _count FROM public.announcements WHERE is_pinned AND id <> NEW.id;
    IF _count >= 3 THEN
      RAISE EXCEPTION 'You can pin at most 3 news items. Unpin one first.';
    END IF;
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS announcements_pin_limit ON public.announcements;
CREATE TRIGGER announcements_pin_limit
BEFORE INSERT OR UPDATE ON public.announcements
FOR EACH ROW EXECUTE FUNCTION public.enforce_pinned_news_limit();

CREATE INDEX IF NOT EXISTS announcements_pinned_idx ON public.announcements (is_pinned, published_at DESC);