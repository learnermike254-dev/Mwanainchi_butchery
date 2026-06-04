-- Enum for roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user', 'rider');

-- ============ USER ROLES ============
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer role check
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users view own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins manage roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- updated_at helper
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- ============ ORDERS ============
CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text NOT NULL UNIQUE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  customer_email text,
  order_type text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  items jsonb NOT NULL,
  subtotal numeric NOT NULL,
  delivery_fee numeric NOT NULL DEFAULT 0,
  total numeric NOT NULL,
  location jsonb,
  zone jsonb,
  notes text,
  assigned_rider_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER orders_updated BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE POLICY "Users view own orders" ON public.orders
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users create own orders" ON public.orders
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins view all orders" ON public.orders
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update all orders" ON public.orders
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete orders" ON public.orders
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Riders view assigned orders" ON public.orders
  FOR SELECT TO authenticated USING (auth.uid() = assigned_rider_id);
CREATE POLICY "Riders update assigned orders" ON public.orders
  FOR UPDATE TO authenticated USING (auth.uid() = assigned_rider_id);

-- ============ INVENTORY ============
CREATE TABLE public.inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_slug text NOT NULL UNIQUE,
  product_name text NOT NULL,
  stock_kg numeric NOT NULL DEFAULT 0,
  low_stock_threshold numeric NOT NULL DEFAULT 0,
  supplier text,
  notes text,
  last_restocked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.inventory TO authenticated;
GRANT SELECT ON public.inventory TO anon;
GRANT ALL ON public.inventory TO service_role;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER inventory_updated BEFORE UPDATE ON public.inventory
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE POLICY "Anyone reads inventory" ON public.inventory
  FOR SELECT USING (true);
CREATE POLICY "Admins manage inventory" ON public.inventory
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============ STOCK MOVEMENTS ============
CREATE TABLE public.stock_movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inventory_id uuid NOT NULL REFERENCES public.inventory(id) ON DELETE CASCADE,
  change_kg numeric NOT NULL,
  reason text NOT NULL,
  note text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.stock_movements TO authenticated;
GRANT ALL ON public.stock_movements TO service_role;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage stock movements" ON public.stock_movements
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============ RIDER PROFILES ============
CREATE TABLE public.rider_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  phone text NOT NULL,
  national_id text,
  vehicle text,
  is_approved boolean NOT NULL DEFAULT false,
  approved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.rider_profiles TO authenticated;
GRANT ALL ON public.rider_profiles TO service_role;
ALTER TABLE public.rider_profiles ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER rider_profiles_updated BEFORE UPDATE ON public.rider_profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE POLICY "Riders view own profile" ON public.rider_profiles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Riders create own profile" ON public.rider_profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Riders update own profile" ON public.rider_profiles
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins manage rider profiles" ON public.rider_profiles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============ BLOG POSTS ============
CREATE TABLE public.blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  excerpt text,
  body text,
  image_url text,
  tag text,
  is_published boolean NOT NULL DEFAULT false,
  published_at timestamptz,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.blog_posts TO authenticated;
GRANT SELECT ON public.blog_posts TO anon;
GRANT ALL ON public.blog_posts TO service_role;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER blog_posts_updated BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE POLICY "Anyone reads published posts" ON public.blog_posts
  FOR SELECT USING (is_published = true);
CREATE POLICY "Admins manage blog posts" ON public.blog_posts
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));