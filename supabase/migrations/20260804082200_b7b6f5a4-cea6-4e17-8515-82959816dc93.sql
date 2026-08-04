ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'event_manager';

ALTER TABLE public.event_rsvps
  ADD COLUMN IF NOT EXISTS edit_token uuid NOT NULL DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

CREATE UNIQUE INDEX IF NOT EXISTS event_rsvps_edit_token_idx ON public.event_rsvps (edit_token);

DROP TRIGGER IF EXISTS event_rsvps_updated ON public.event_rsvps;
CREATE TRIGGER event_rsvps_updated
BEFORE UPDATE ON public.event_rsvps
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();