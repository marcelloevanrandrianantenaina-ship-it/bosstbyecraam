
-- Simplify admin auth: remove triple-password gate
DROP FUNCTION IF EXISTS public.verify_admin_gate(text, text, text);
ALTER TABLE public.site_settings DROP COLUMN IF EXISTS admin_gate_1;
ALTER TABLE public.site_settings DROP COLUMN IF EXISTS admin_gate_2;
ALTER TABLE public.site_settings DROP COLUMN IF EXISTS admin_gate_3;

-- Reset admin password to a known value so the user can log in again
UPDATE auth.users
SET encrypted_password = crypt('Admin@2026!', gen_salt('bf')),
    email_confirmed_at = COALESCE(email_confirmed_at, now()),
    updated_at = now()
WHERE email = 'marcelloevanrandrianantenaina@gmail.com';

-- Ensure admin role exists
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role FROM auth.users
WHERE email = 'marcelloevanrandrianantenaina@gmail.com'
ON CONFLICT DO NOTHING;
