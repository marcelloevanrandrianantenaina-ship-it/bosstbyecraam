
CREATE OR REPLACE FUNCTION public.approve_recharge(_recharge_id uuid)
RETURNS TABLE(ok boolean, message text, new_balance numeric)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  r RECORD;
  v_balance numeric;
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN
    RETURN QUERY SELECT false, 'forbidden'::text, 0::numeric;
    RETURN;
  END IF;

  -- Lock the row to prevent concurrent approval
  SELECT * INTO r FROM public.recharges WHERE id = _recharge_id FOR UPDATE;

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'not_found'::text, 0::numeric;
    RETURN;
  END IF;

  IF r.status <> 'pending' THEN
    RETURN QUERY SELECT false, ('already_'||r.status::text)::text, 0::numeric;
    RETURN;
  END IF;

  UPDATE public.profiles
     SET balance = COALESCE(balance,0) + r.amount
   WHERE id = r.user_id
  RETURNING balance INTO v_balance;

  UPDATE public.recharges
     SET status = 'approved',
         processed_at = now()
   WHERE id = _recharge_id;

  INSERT INTO public.notifications(user_id, title, body, type)
  VALUES (r.user_id, 'Recharge approuvée',
          'Votre recharge de '||r.amount||' Ar a été créditée.', 'recharge');

  RETURN QUERY SELECT true, 'approved'::text, v_balance;
END;
$$;

CREATE OR REPLACE FUNCTION public.reject_recharge(_recharge_id uuid, _note text DEFAULT NULL)
RETURNS TABLE(ok boolean, message text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  r RECORD;
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN
    RETURN QUERY SELECT false, 'forbidden'::text; RETURN;
  END IF;

  SELECT * INTO r FROM public.recharges WHERE id = _recharge_id FOR UPDATE;
  IF NOT FOUND THEN RETURN QUERY SELECT false, 'not_found'::text; RETURN; END IF;
  IF r.status <> 'pending' THEN
    RETURN QUERY SELECT false, ('already_'||r.status::text)::text; RETURN;
  END IF;

  UPDATE public.recharges
     SET status = 'rejected', processed_at = now(), admin_note = COALESCE(_note, admin_note)
   WHERE id = _recharge_id;

  INSERT INTO public.notifications(user_id, title, body, type)
  VALUES (r.user_id, 'Recharge refusée',
          'Votre recharge de '||r.amount||' Ar a été refusée.', 'recharge');

  RETURN QUERY SELECT true, 'rejected'::text;
END;
$$;

REVOKE ALL ON FUNCTION public.approve_recharge(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.reject_recharge(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.approve_recharge(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.reject_recharge(uuid, text) TO authenticated;
