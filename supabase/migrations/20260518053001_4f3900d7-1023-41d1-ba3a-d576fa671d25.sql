-- Add instagram platform
ALTER TYPE service_platform ADD VALUE IF NOT EXISTS 'instagram';

-- Add sender_number + unique reference for recharges
ALTER TABLE public.recharges ADD COLUMN IF NOT EXISTS sender_number text;
CREATE UNIQUE INDEX IF NOT EXISTS recharges_reference_unique
  ON public.recharges (lower(reference))
  WHERE reference IS NOT NULL AND reference <> '';