ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS admin_gate_1 text,
  ADD COLUMN IF NOT EXISTS admin_gate_2 text,
  ADD COLUMN IF NOT EXISTS admin_gate_3 text;

UPDATE public.site_settings
   SET admin_gate_1 = COALESCE(admin_gate_1, '26mars2008'),
       admin_gate_2 = COALESCE(admin_gate_2, 'admin26mars2008'),
       admin_gate_3 = COALESCE(admin_gate_3, '26mars2008')
 WHERE id = 1;

-- Secure RPC: only admins can verify the 3 gate passwords (returns boolean only, never leaks values)
CREATE OR REPLACE FUNCTION public.verify_admin_gate(_p1 text, _p2 text, _p3 text)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE ok boolean;
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN
    RETURN false;
  END IF;
  SELECT (admin_gate_1 = _p1 AND admin_gate_2 = _p2 AND admin_gate_3 = _p3)
    INTO ok FROM public.site_settings WHERE id = 1;
  RETURN COALESCE(ok, false);
END;
$$;

REVOKE ALL ON FUNCTION public.verify_admin_gate(text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.verify_admin_gate(text, text, text) TO authenticated;