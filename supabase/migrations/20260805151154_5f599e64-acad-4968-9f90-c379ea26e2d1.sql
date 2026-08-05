ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS contact_whatsapp text;

CREATE OR REPLACE FUNCTION public.guard_developer_whatsapp()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.developer_whatsapp IS DISTINCT FROM OLD.developer_whatsapp
     AND NOT public.is_super_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Only level one admins can change the developer WhatsApp number';
  END IF;
  IF NEW.contact_whatsapp IS DISTINCT FROM OLD.contact_whatsapp
     AND NOT public.is_super_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Only level one admins can change the contact WhatsApp number';
  END IF;
  RETURN NEW;
END;
$function$;