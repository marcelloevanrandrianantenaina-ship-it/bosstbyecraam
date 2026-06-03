ALTER TABLE public.services
  ADD COLUMN IF NOT EXISTS discount_pct integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS popularity_pct integer NOT NULL DEFAULT 85,
  ADD COLUMN IF NOT EXISTS available boolean NOT NULL DEFAULT true;

ALTER TABLE public.services
  ADD CONSTRAINT services_discount_pct_range CHECK (discount_pct >= 0 AND discount_pct <= 90),
  ADD CONSTRAINT services_popularity_pct_range CHECK (popularity_pct >= 0 AND popularity_pct <= 100);