ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS asset_whatsapp_message_ccgms text,
  ADD COLUMN IF NOT EXISTS asset_whatsapp_message_other text;

UPDATE public.site_settings
SET asset_whatsapp_message_ccgms = COALESCE(asset_whatsapp_message_ccgms, 'Hello CCGMs, I would like to request {asset} from {start} to {end}.'),
    asset_whatsapp_message_other = COALESCE(asset_whatsapp_message_other, 'Hello, I would like to rent {asset} from {start} to {end}. Is it available?')
WHERE id = 1;