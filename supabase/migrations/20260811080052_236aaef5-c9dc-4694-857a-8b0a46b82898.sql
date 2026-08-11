ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS card_image_ratio numeric NOT NULL DEFAULT 1.414;

ALTER TABLE public.site_settings
  ADD CONSTRAINT site_settings_card_image_ratio_range CHECK (card_image_ratio >= 0.4 AND card_image_ratio <= 3);

GRANT SELECT (card_image_ratio) ON public.site_settings TO anon, authenticated;