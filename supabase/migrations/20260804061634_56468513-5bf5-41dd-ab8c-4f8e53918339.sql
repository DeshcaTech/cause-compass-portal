ALTER TABLE public.news_subscribers
  ADD COLUMN IF NOT EXISTS unsubscribe_token uuid NOT NULL DEFAULT gen_random_uuid();

CREATE UNIQUE INDEX IF NOT EXISTS news_subscribers_unsubscribe_token_key
  ON public.news_subscribers (unsubscribe_token);