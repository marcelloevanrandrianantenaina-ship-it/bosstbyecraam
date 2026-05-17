
-- ============ ENUMS ============
CREATE TYPE public.app_role AS ENUM ('admin', 'sub_admin', 'user');
CREATE TYPE public.order_status AS ENUM ('pending', 'in_progress', 'completed', 'cancelled', 'refunded');
CREATE TYPE public.recharge_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE public.service_platform AS ENUM ('facebook', 'tiktok');
CREATE TYPE public.service_badge AS ENUM ('none', 'top', 'new', 'fast');

-- ============ PROFILES ============
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id text UNIQUE NOT NULL DEFAULT 'CL-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,8)),
  full_name text,
  email text,
  avatar_url text,
  balance numeric(12,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ============ USER_ROLES ============
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to avoid RLS recursion
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = _user_id AND role IN ('admin','sub_admin')
  );
$$;

-- ============ SERVICES ============
CREATE TABLE public.services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform public.service_platform NOT NULL,
  name text NOT NULL,
  description text,
  price_per_1k numeric(12,2) NOT NULL DEFAULT 0,
  supplier_price_per_1k numeric(12,2) NOT NULL DEFAULT 0,
  margin_pct numeric(5,2) NOT NULL DEFAULT 20,
  min_quantity int NOT NULL DEFAULT 100,
  max_quantity int NOT NULL DEFAULT 100000,
  estimated_time text DEFAULT '0-1h',
  badge public.service_badge NOT NULL DEFAULT 'none',
  is_active boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- ============ ORDERS ============
CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  service_id uuid NOT NULL REFERENCES public.services(id),
  service_name text NOT NULL,
  link text NOT NULL,
  quantity int NOT NULL,
  unit_price numeric(12,2) NOT NULL,
  total_price numeric(12,2) NOT NULL,
  status public.order_status NOT NULL DEFAULT 'pending',
  progress int NOT NULL DEFAULT 0,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- ============ RECHARGES ============
CREATE TABLE public.recharges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount numeric(12,2) NOT NULL,
  status public.recharge_status NOT NULL DEFAULT 'pending',
  method text NOT NULL DEFAULT 'whatsapp',
  reference text,
  admin_note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz
);
ALTER TABLE public.recharges ENABLE ROW LEVEL SECURITY;

-- ============ ANNOUNCEMENTS ============
CREATE TABLE public.announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  type text NOT NULL DEFAULT 'banner', -- banner | slider | popup
  is_active boolean NOT NULL DEFAULT true,
  starts_at timestamptz,
  ends_at timestamptz,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- ============ NOTIFICATIONS ============
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  body text,
  type text NOT NULL DEFAULT 'info',
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- ============ ADMIN LOGS ============
CREATE TABLE public.admin_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  target_type text,
  target_id text,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;

-- ============ PRICING SETTINGS ============
CREATE TABLE public.pricing_settings (
  id int PRIMARY KEY DEFAULT 1,
  mode text NOT NULL DEFAULT 'auto_plus_20', -- manual | auto | auto_plus_20
  auto_update_enabled boolean NOT NULL DEFAULT true,
  global_margin_pct numeric(5,2) NOT NULL DEFAULT 20,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT single_row CHECK (id = 1)
);
ALTER TABLE public.pricing_settings ENABLE ROW LEVEL SECURITY;
INSERT INTO public.pricing_settings (id) VALUES (1);

-- ============ TRIGGERS: updated_at ============
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER trg_services_updated BEFORE UPDATE ON public.services
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER trg_orders_updated BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ============ AUTO-CREATE PROFILE + ADMIN ROLE ============
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email,'@',1)),
    NEW.email,
    NEW.raw_user_meta_data->>'avatar_url'
  );

  IF NEW.email = 'marcelloevanrandrianantenaina@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin')
    ON CONFLICT DO NOTHING;
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user')
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ RLS POLICIES ============

-- profiles
CREATE POLICY "Users view own profile" ON public.profiles FOR SELECT
  USING (auth.uid() = id);
CREATE POLICY "Admins view all profiles" ON public.profiles FOR SELECT
  USING (public.is_admin(auth.uid()));
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE
  USING (auth.uid() = id);
CREATE POLICY "Admins update any profile" ON public.profiles FOR UPDATE
  USING (public.is_admin(auth.uid()));

-- user_roles
CREATE POLICY "Users view own roles" ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "Admins view all roles" ON public.user_roles FOR SELECT
  USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins manage roles" ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));

-- services (public read of active)
CREATE POLICY "Anyone views active services" ON public.services FOR SELECT
  USING (is_active = true OR public.is_admin(auth.uid()));
CREATE POLICY "Admins manage services" ON public.services FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- orders
CREATE POLICY "Users view own orders" ON public.orders FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "Admins view all orders" ON public.orders FOR SELECT
  USING (public.is_admin(auth.uid()));
CREATE POLICY "Users create own orders" ON public.orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins update orders" ON public.orders FOR UPDATE
  USING (public.is_admin(auth.uid()));

-- recharges
CREATE POLICY "Users view own recharges" ON public.recharges FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "Admins view all recharges" ON public.recharges FOR SELECT
  USING (public.is_admin(auth.uid()));
CREATE POLICY "Users create own recharges" ON public.recharges FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins manage recharges" ON public.recharges FOR UPDATE
  USING (public.is_admin(auth.uid()));

-- announcements (public active)
CREATE POLICY "Anyone views active announcements" ON public.announcements FOR SELECT
  USING (is_active = true OR public.is_admin(auth.uid()));
CREATE POLICY "Admins manage announcements" ON public.announcements FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- notifications
CREATE POLICY "Users view own notifications" ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "Users update own notifications" ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);
CREATE POLICY "Admins create notifications" ON public.notifications FOR INSERT
  WITH CHECK (public.is_admin(auth.uid()) OR auth.uid() = user_id);

-- admin_logs
CREATE POLICY "Admins view logs" ON public.admin_logs FOR SELECT
  USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins create logs" ON public.admin_logs FOR INSERT
  WITH CHECK (public.is_admin(auth.uid()));

-- pricing_settings
CREATE POLICY "Anyone reads pricing" ON public.pricing_settings FOR SELECT USING (true);
CREATE POLICY "Admins update pricing" ON public.pricing_settings FOR UPDATE
  USING (public.is_admin(auth.uid()));

-- ============ SEED SERVICES ============
INSERT INTO public.services (platform, name, description, price_per_1k, supplier_price_per_1k, estimated_time, badge, sort_order) VALUES
  ('facebook','Boost Réactions Publication','Likes & réactions rapides sur vos posts',1200,1000,'0-1h','top',1),
  ('facebook','Boost Réactions Commentaires','Likes sur commentaires de publication',1500,1250,'0-2h','new',2),
  ('facebook','Auto Commentaires','Commentaires automatiques pertinents',2400,2000,'1-3h','none',3),
  ('facebook','Boost Partages','Partages réels pour viralité',1800,1500,'0-2h','fast',4),
  ('facebook','Boost Vues Vidéo','Vues qualifiées sur vos vidéos',900,750,'0-1h','top',5),
  ('facebook','Boost Followers Page','Abonnés stables pour votre page',3000,2500,'2-12h','none',6),
  ('tiktok','Likes TikTok','Likes rapides sur vos vidéos',1100,900,'0-1h','top',1),
  ('tiktok','Followers TikTok','Abonnés réels et stables',2800,2300,'1-6h','new',2),
  ('tiktok','Vues TikTok','Vues massives pour booster l''algorithme',700,550,'0-1h','fast',3);

-- ============ SEED ANNOUNCEMENTS ============
INSERT INTO public.announcements (title, content, type, sort_order) VALUES
  ('Lancement', '⚡ ẞoost-by Ecr_aaM est en ligne — Service 24h/24', 'banner', 1),
  ('Promo', '🔥 -10% sur les Likes TikTok cette semaine', 'banner', 2),
  ('Nouveau', '⭐ Nouveaux services Facebook disponibles', 'banner', 3);
