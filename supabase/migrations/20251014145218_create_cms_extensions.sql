/*
  # CMS Extensions for RÜMBL

  ## Overview
  Adds additional functionality to existing tables:
  - Site content management
  - Mission system for ambassadors
  - Order management for products
  - Activity tracking

  ## New Tables

  ### site_content
  - Site content management

  ### ambassador_missions
  - Mission system

  ### ambassador_mission_assignments
  - Mission assignments to ambassadors

  ### product_orders
  - Product orders (CDJ Yugi, Exoskeleton)

  ### site_analytics
  - Site analytics tracking
*/

-- Site content table
CREATE TABLE IF NOT EXISTS site_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page text NOT NULL,
  section text NOT NULL,
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz DEFAULT now(),
  updated_by uuid,
  UNIQUE(page, section)
);

-- Ambassador missions table
CREATE TABLE IF NOT EXISTS ambassador_missions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  points_reward integer DEFAULT 0,
  deadline timestamptz,
  status text DEFAULT 'active' CHECK (status IN ('active', 'completed', 'expired')),
  created_at timestamptz DEFAULT now()
);

-- Ambassador mission assignments table
CREATE TABLE IF NOT EXISTS ambassador_mission_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id uuid REFERENCES ambassador_missions(id) ON DELETE CASCADE NOT NULL,
  ambassador_id uuid REFERENCES ambassadors(id) ON DELETE CASCADE NOT NULL,
  status text DEFAULT 'assigned' CHECK (status IN ('assigned', 'in_progress', 'completed', 'failed')),
  assigned_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  proof_url text,
  UNIQUE(mission_id, ambassador_id)
);

-- Product orders table
CREATE TABLE IF NOT EXISTS product_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_type text NOT NULL CHECK (product_type IN ('cdj_yugi', 'exoskeleton')),
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text,
  order_details jsonb NOT NULL DEFAULT '{}'::jsonb,
  payment_method text CHECK (payment_method IN ('crypto', 'paypal', 'other')),
  payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'shipped', 'cancelled')),
  total_amount numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  shipped_at timestamptz
);

-- Site analytics table
CREATE TABLE IF NOT EXISTS site_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  data jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_site_content_page ON site_content(page);
CREATE INDEX IF NOT EXISTS idx_ambassador_missions_status ON ambassador_missions(status);
CREATE INDEX IF NOT EXISTS idx_mission_assignments_ambassador ON ambassador_mission_assignments(ambassador_id);
CREATE INDEX IF NOT EXISTS idx_mission_assignments_mission ON ambassador_mission_assignments(mission_id);
CREATE INDEX IF NOT EXISTS idx_product_orders_type ON product_orders(product_type);
CREATE INDEX IF NOT EXISTS idx_product_orders_status ON product_orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_site_analytics_type ON site_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_site_analytics_created ON site_analytics(created_at DESC);

-- Enable RLS
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE ambassador_missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ambassador_mission_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_analytics ENABLE ROW LEVEL SECURITY;

-- Policies for site_content
CREATE POLICY "Public can view site content"
  ON site_content
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can manage site content"
  ON site_content
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policies for ambassador_missions
CREATE POLICY "Public can view active missions"
  ON ambassador_missions
  FOR SELECT
  TO public
  USING (status = 'active');

CREATE POLICY "Authenticated users can manage missions"
  ON ambassador_missions
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policies for mission assignments
CREATE POLICY "Ambassadors can view own assignments"
  ON ambassador_mission_assignments
  FOR SELECT
  TO authenticated
  USING (
    ambassador_id IN (
      SELECT id FROM ambassadors WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can manage assignments"
  ON ambassador_mission_assignments
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policies for product orders
CREATE POLICY "Public can create orders"
  ON product_orders
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view all orders"
  ON product_orders
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update orders"
  ON product_orders
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policies for analytics
CREATE POLICY "Public can create analytics"
  ON site_analytics
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view analytics"
  ON site_analytics
  FOR SELECT
  TO authenticated
  USING (true);

-- Insert default site content
INSERT INTO site_content (page, section, content) VALUES
  ('home', 'hero', '{"title": "RÜMBL", "subtitle": "From the underground to your senses.", "tagline": "Hard & Groovy Techno // Paris banlieue"}'::jsonb),
  ('home', 'next_event', '{"title": "PROCHAIN ÉVÉNEMENT", "event": "TBA - Date à venir", "location": "Lieu à confirmer"}'::jsonb),
  ('about', 'description', '{"text": "RÜMBL est un collectif d''événements techno underground basé en région parisienne."}'::jsonb)
ON CONFLICT (page, section) DO NOTHING;

-- Function to approve ambassador application
CREATE OR REPLACE FUNCTION approve_ambassador_application(
  application_id uuid
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_first_name text;
  v_last_name text;
  v_email text;
  v_instagram text;
  v_ambassador_id uuid;
  v_ref_code text;
BEGIN
  SELECT first_name, last_name, email, instagram
  INTO v_first_name, v_last_name, v_email, v_instagram
  FROM ambassador_applications
  WHERE id = application_id AND status = 'pending';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Application not found or already processed';
  END IF;

  v_ref_code := lower(regexp_replace(v_first_name, '[^a-zA-Z0-9]', '', 'g'));

  INSERT INTO ambassadors (name, ref_code, email, instagram_handle, is_active)
  VALUES (v_first_name || ' ' || v_last_name, v_ref_code, v_email, v_instagram, true)
  RETURNING id INTO v_ambassador_id;

  UPDATE ambassador_applications
  SET status = 'approved', reviewed_at = now()
  WHERE id = application_id;

  RETURN v_ambassador_id;
END;
$$;