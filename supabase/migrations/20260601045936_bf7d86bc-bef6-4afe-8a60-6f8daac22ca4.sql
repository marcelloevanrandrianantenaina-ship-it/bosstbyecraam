-- Balance transfer system
CREATE TABLE public.balance_transfers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL,
  recipient_id uuid NOT NULL,
  recipient_client_id text NOT NULL,
  amount numeric NOT NULL CHECK (amount > 0),
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.balance_transfers TO authenticated;
GRANT ALL ON public.balance_transfers TO service_role;

ALTER TABLE public.balance_transfers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own transfers"
ON public.balance_transfers FOR SELECT TO authenticated
USING (auth.uid() = sender_id OR auth.uid() = recipient_id OR public.is_admin(auth.uid()));

CREATE POLICY "Admins view all transfers"
ON public.balance_transfers FOR SELECT TO authenticated
USING (public.is_admin(auth.uid()));

CREATE INDEX idx_transfers_sender ON public.balance_transfers(sender_id, created_at DESC);
CREATE INDEX idx_transfers_recipient ON public.balance_transfers(recipient_id, created_at DESC);

-- Atomic transfer RPC
CREATE OR REPLACE FUNCTION public.transfer_balance(
  _recipient_client_id text,
  _amount numeric,
  _note text DEFAULT NULL
)
RETURNS TABLE(ok boolean, message text, new_balance numeric)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_sender uuid := auth.uid();
  v_recipient uuid;
  v_sender_balance numeric;
  v_new_balance numeric;
BEGIN
  IF v_sender IS NULL THEN
    RETURN QUERY SELECT false, 'unauthenticated'::text, 0::numeric; RETURN;
  END IF;
  IF _amount IS NULL OR _amount <= 0 THEN
    RETURN QUERY SELECT false, 'invalid_amount'::text, 0::numeric; RETURN;
  END IF;

  SELECT id INTO v_recipient FROM public.profiles WHERE client_id = _recipient_client_id;
  IF v_recipient IS NULL THEN
    RETURN QUERY SELECT false, 'recipient_not_found'::text, 0::numeric; RETURN;
  END IF;
  IF v_recipient = v_sender THEN
    RETURN QUERY SELECT false, 'cannot_transfer_to_self'::text, 0::numeric; RETURN;
  END IF;

  -- Lock sender row
  SELECT balance INTO v_sender_balance FROM public.profiles WHERE id = v_sender FOR UPDATE;
  IF v_sender_balance < _amount THEN
    RETURN QUERY SELECT false, 'insufficient_balance'::text, v_sender_balance; RETURN;
  END IF;

  UPDATE public.profiles SET balance = balance - _amount WHERE id = v_sender
    RETURNING balance INTO v_new_balance;
  UPDATE public.profiles SET balance = balance + _amount WHERE id = v_recipient;

  INSERT INTO public.balance_transfers(sender_id, recipient_id, recipient_client_id, amount, note)
  VALUES (v_sender, v_recipient, _recipient_client_id, _amount, _note);

  INSERT INTO public.notifications(user_id, title, body, type) VALUES
    (v_sender, 'Transfert envoyé', 'Vous avez envoyé '||_amount||' Ar à '||_recipient_client_id, 'transfer'),
    (v_recipient, 'Transfert reçu', 'Vous avez reçu '||_amount||' Ar', 'transfer');

  RETURN QUERY SELECT true, 'ok'::text, v_new_balance;
END;
$$;

REVOKE ALL ON FUNCTION public.transfer_balance(text, numeric, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.transfer_balance(text, numeric, text) TO authenticated;