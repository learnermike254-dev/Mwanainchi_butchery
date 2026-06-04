-- ============ ADMIN ACCOUNTS (Multi-admin support with password reset) ============
CREATE TABLE public.admin_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  role text NOT NULL DEFAULT 'manager', -- manager, viewer, super_admin
  is_active boolean NOT NULL DEFAULT true,
  last_login_at timestamptz,
  password_changed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.admin_accounts TO authenticated;
GRANT ALL ON public.admin_accounts TO service_role;
ALTER TABLE public.admin_accounts ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER admin_accounts_updated BEFORE UPDATE ON public.admin_accounts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE POLICY "Admins view all admins" ON public.admin_accounts
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage admin accounts" ON public.admin_accounts
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins view own account" ON public.admin_accounts
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- ============ ORDER NOTIFICATIONS (WhatsApp updates) ============
CREATE TABLE public.order_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  phone_number text NOT NULL,
  notification_type text NOT NULL, -- "order_received", "order_preparing", "order_ready", "delivered"
  message text NOT NULL,
  sent_at timestamptz,
  delivery_status text DEFAULT 'pending', -- pending, sent, failed
  retry_count integer DEFAULT 0,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.order_notifications TO authenticated;
GRANT ALL ON public.order_notifications TO service_role;
ALTER TABLE public.order_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage notifications" ON public.order_notifications
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX order_notifications_order_id ON public.order_notifications(order_id);
CREATE INDEX order_notifications_phone_number ON public.order_notifications(phone_number);
CREATE INDEX order_notifications_delivery_status ON public.order_notifications(delivery_status);

-- ============ POS SYNC LOGS (Inventory sync tracking) ============
CREATE TABLE public.pos_sync_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sync_status text NOT NULL, -- "pending", "syncing", "success", "failed"
  items_synced integer,
  error_message text,
  sync_duration_ms integer,
  pos_system text DEFAULT 'butchery_workstation', -- system identifier
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  synced_at timestamptz
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pos_sync_logs TO authenticated;
GRANT ALL ON public.pos_sync_logs TO service_role;
ALTER TABLE public.pos_sync_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins view sync logs" ON public.pos_sync_logs
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Service role manages sync logs" ON public.pos_sync_logs
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE INDEX pos_sync_logs_sync_status ON public.pos_sync_logs(sync_status);
CREATE INDEX pos_sync_logs_created_at ON public.pos_sync_logs(created_at DESC);

-- ============ STOCK MOVEMENT HISTORY ============
-- Extend existing stock_movements table with more details
ALTER TABLE public.stock_movements 
  ADD COLUMN IF NOT EXISTS movement_type text DEFAULT 'manual', -- manual, pos_sync, order_fulfillment
  ADD COLUMN IF NOT EXISTS reference_id text; -- order_id, pos_transaction_id, etc.

-- ============ BLOG UPLOADS (Image storage references) ============
CREATE TABLE public.blog_uploads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  blog_post_id uuid REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_path text NOT NULL,
  file_size integer,
  mime_type text,
  uploaded_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  storage_bucket text DEFAULT 'blog-images',
  url text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.blog_uploads TO authenticated;
GRANT ALL ON public.blog_uploads TO service_role;
ALTER TABLE public.blog_uploads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage uploads" ON public.blog_uploads
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Anyone view published uploads" ON public.blog_uploads
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.blog_posts WHERE id = blog_post_id AND is_published = true));

-- ============ ORDERS EXTENDED FIELDS ============
-- Add delivery tracking and rider info
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS delivery_status text DEFAULT 'pending', -- pending, assigned, picked_up, in_transit, delivered, cancelled
  ADD COLUMN IF NOT EXISTS rider_accepted_at timestamptz,
  ADD COLUMN IF NOT EXISTS picked_up_at timestamptz,
  ADD COLUMN IF NOT EXISTS delivery_completed_at timestamptz,
  ADD COLUMN IF NOT EXISTS delivery_address text,
  ADD COLUMN IF NOT EXISTS delivery_notes text;

-- Create index for order queries
CREATE INDEX IF NOT EXISTS orders_customer_phone ON public.orders(customer_phone);
CREATE INDEX IF NOT EXISTS orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS orders_delivery_status ON public.orders(delivery_status);

-- ============ REAL-TIME TRIGGER FOR INVENTORY CHANGES ============
CREATE OR REPLACE FUNCTION notify_inventory_change()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM pg_notify(
    'inventory_changes',
    json_build_object(
      'id', NEW.id,
      'product_slug', NEW.product_slug,
      'product_name', NEW.product_name,
      'stock_kg', NEW.stock_kg,
      'low_stock_threshold', NEW.low_stock_threshold,
      'action', TG_OP
    )::text
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER inventory_change_notification
  AFTER INSERT OR UPDATE ON public.inventory
  FOR EACH ROW
  EXECUTE FUNCTION notify_inventory_change();

-- ============ REAL-TIME TRIGGER FOR ORDER CHANGES ============
CREATE OR REPLACE FUNCTION notify_order_change()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM pg_notify(
    'order_changes',
    json_build_object(
      'id', NEW.id,
      'order_number', NEW.order_number,
      'status', NEW.status,
      'delivery_status', NEW.delivery_status,
      'customer_phone', NEW.customer_phone,
      'action', TG_OP
    )::text
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER order_change_notification
  AFTER INSERT OR UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION notify_order_change();

-- ============ WHATSAPP MESSAGE QUEUE ============
CREATE TABLE public.whatsapp_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number text NOT NULL,
  message_body text NOT NULL,
  message_type text DEFAULT 'notification', -- notification, otp, alert
  related_order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  status text DEFAULT 'pending', -- pending, sent, failed, discarded
  retry_count integer DEFAULT 0,
  max_retries integer DEFAULT 3,
  sent_at timestamptz,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.whatsapp_queue TO authenticated;
GRANT ALL ON public.whatsapp_queue TO service_role;
ALTER TABLE public.whatsapp_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages queue" ON public.whatsapp_queue
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE INDEX whatsapp_queue_status ON public.whatsapp_queue(status);
CREATE INDEX whatsapp_queue_created_at ON public.whatsapp_queue(created_at);
