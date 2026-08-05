ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS developer_whatsapp text;

CREATE OR REPLACE FUNCTION public.guard_developer_whatsapp()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.developer_whatsapp IS DISTINCT FROM OLD.developer_whatsapp
     AND NOT public.is_super_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Only level one admins can change the developer WhatsApp number';
  END IF;
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.guard_developer_whatsapp() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS guard_developer_whatsapp_trg ON public.site_settings;
CREATE TRIGGER guard_developer_whatsapp_trg
BEFORE UPDATE ON public.site_settings
FOR EACH ROW EXECUTE FUNCTION public.guard_developer_whatsapp();