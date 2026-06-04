-- ============ PHONE USERS ============
-- Table to store phone-based user accounts (separate from Supabase auth)
CREATE TABLE public.phone_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number text NOT NULL UNIQUE,
  verified boolean NOT NULL DEFAULT false,
  last_login timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.phone_users TO authenticated;
GRANT ALL ON public.phone_users TO service_role;
ALTER TABLE public.phone_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins view all phone users" ON public.phone_users
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- ============ PHONE OTP ============
-- Table to store OTP codes for phone-based authentication
CREATE TABLE public.phone_otp (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number text NOT NULL UNIQUE,
  otp_code text NOT NULL,
  expires_at timestamptz NOT NULL,
  verified boolean NOT NULL DEFAULT false,
  attempts integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT INSERT, UPDATE ON public.phone_otp TO authenticated;
GRANT ALL ON public.phone_otp TO service_role;
ALTER TABLE public.phone_otp ENABLE ROW LEVEL SECURITY;

-- Automatically clean up expired OTPs (optional, can be done manually or with a cron job)
CREATE OR REPLACE FUNCTION public.cleanup_expired_otps()
RETURNS void AS $$
BEGIN
  DELETE FROM public.phone_otp WHERE expires_at < now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create indexes for faster lookups
CREATE INDEX phone_users_phone_number_idx ON public.phone_users(phone_number);
CREATE INDEX phone_otp_phone_number_idx ON public.phone_otp(phone_number);
CREATE INDEX phone_otp_expires_at_idx ON public.phone_otp(expires_at);
