-- 1. Table singleton
CREATE TABLE public.site_settings (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  site_name text NOT NULL DEFAULT 'ẞoost-by Ecr_aaM',
  slogan text NOT NULL DEFAULT 'Boostez vos réseaux sociaux',
  logo_url text,
  primary_color text NOT NULL DEFAULT 'oklch(0.78 0.17 65)',
  whatsapp_number text NOT NULL DEFAULT '0347856539',
  whatsapp_intl text NOT NULL DEFAULT '+261347856539',
  facebook_url text DEFAULT '',
  instagram_url text DEFAULT '',
  tiktok_url text DEFAULT '',
  mvola_number text NOT NULL DEFAULT '0347856539',
  mvola_owner text NOT NULL DEFAULT 'Randrianbelo Sophia',
  mvola_instructions text DEFAULT '',
  welcome_message text DEFAULT '',
  footer_text text NOT NULL DEFAULT 'ẞoost-by Ecr_aaM © 2026',
  min_recharge integer NOT NULL DEFAULT 1000,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid
);

-- 2. GRANTs (publiquement lisible, admin écrit via RLS)
GRANT SELECT ON public.site_settings TO anon, authenticated;
GRANT UPDATE ON public.site_settings TO authenticated;
GRANT ALL ON public.site_settings TO service_role;

-- 3. RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- 4. Policies
CREATE POLICY "Anyone reads site settings"
  ON public.site_settings FOR SELECT
  USING (true);

CREATE POLICY "Admins update site settings"
  ON public.site_settings FOR UPDATE
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- (Pas de policy INSERT/DELETE => singleton garanti)

-- 5. Trigger updated_at
CREATE TRIGGER touch_site_settings_updated_at
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- 6. Ligne par défaut
INSERT INTO public.site_settings (id) VALUES (1)
ON CONFLICT (id) DO NOTHING;