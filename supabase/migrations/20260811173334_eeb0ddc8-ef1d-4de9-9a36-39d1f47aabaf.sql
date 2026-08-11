ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS business_whatsapp_message text,
  ADD COLUMN IF NOT EXISTS group_whatsapp_message text;

UPDATE public.site_settings
SET business_whatsapp_message = COALESCE(business_whatsapp_message, 'Hello {business}, I found you on the CCGMs website and would like to know more.'),
    group_whatsapp_message = COALESCE(group_whatsapp_message, 'Hello, I would like to know more about {group}.')
WHERE id = 1;