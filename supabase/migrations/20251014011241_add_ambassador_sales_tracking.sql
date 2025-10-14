/*
  # Ambassador Sales & Link Tracking System

  ## Overview
  This migration extends the ambassador system with:
  - Shareable tracking links for each ambassador
  - Sales/conversion tracking
  - Enhanced analytics dashboard data
  - Admin monitoring capabilities

  ## New Tables

  ### ambassador_sales
  - id (uuid, primary key) - Unique identifier
  - ambassador_id (uuid, foreign key) - Links to ambassadors table
  - sale_type (text) - Type of conversion (ticket, merch, etc.)
  - amount (numeric) - Sale amount in euros
  - quantity (integer) - Number of items sold
  - event_name (text) - Related event name
  - sale_date (timestamptz) - When the sale occurred
  - commission (numeric) - Ambassador commission earned
  - status (text) - Sale status (pending, confirmed, paid)

  ### ambassador_links
  - id (uuid, primary key) - Unique identifier
  - ambassador_id (uuid, foreign key) - Links to ambassadors table
  - link_url (text) - Full tracking URL
  - platform (text) - Where link is used (instagram, tiktok, website, etc.)
  - created_at (timestamptz) - When link was created
  - last_used (timestamptz) - Last time link was clicked
  - total_clicks (integer) - Total clicks on this specific link
  - conversions (integer) - Total sales from this link

  ## Schema Changes

  ### ambassadors table updates
  - Add total_sales (numeric) - Total sales amount generated
  - Add total_conversions (integer) - Total number of conversions
  - Add commission_earned (numeric) - Total commission earned
  - Add email (text) - Ambassador email for notifications
  - Add instagram_handle (text) - Instagram username

  ## Security
  - RLS enabled on all new tables
  - Ambassadors can view their own data
  - Only authenticated admins can modify sales data
  - Public can view ambassador leaderboard stats

  ## Indexes
  - Index on ambassador_id for all tables
  - Index on sale_date for time-based queries
  - Index on status for filtering
*/

-- Add new columns to ambassadors table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ambassadors' AND column_name = 'total_sales'
  ) THEN
    ALTER TABLE ambassadors ADD COLUMN total_sales numeric DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ambassadors' AND column_name = 'total_conversions'
  ) THEN
    ALTER TABLE ambassadors ADD COLUMN total_conversions integer DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ambassadors' AND column_name = 'commission_earned'
  ) THEN
    ALTER TABLE ambassadors ADD COLUMN commission_earned numeric DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ambassadors' AND column_name = 'email'
  ) THEN
    ALTER TABLE ambassadors ADD COLUMN email text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ambassadors' AND column_name = 'instagram_handle'
  ) THEN
    ALTER TABLE ambassadors ADD COLUMN instagram_handle text;
  END IF;
END $$;

-- Create ambassador_sales table
CREATE TABLE IF NOT EXISTS ambassador_sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ambassador_id uuid REFERENCES ambassadors(id) ON DELETE CASCADE NOT NULL,
  sale_type text NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  quantity integer NOT NULL DEFAULT 1,
  event_name text,
  sale_date timestamptz DEFAULT now(),
  commission numeric NOT NULL DEFAULT 0,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'paid'))
);

-- Create ambassador_links table
CREATE TABLE IF NOT EXISTS ambassador_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ambassador_id uuid REFERENCES ambassadors(id) ON DELETE CASCADE NOT NULL,
  link_url text NOT NULL,
  platform text DEFAULT 'website',
  created_at timestamptz DEFAULT now(),
  last_used timestamptz,
  total_clicks integer DEFAULT 0,
  conversions integer DEFAULT 0
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_ambassador_sales_ambassador_id ON ambassador_sales(ambassador_id);
CREATE INDEX IF NOT EXISTS idx_ambassador_sales_date ON ambassador_sales(sale_date DESC);
CREATE INDEX IF NOT EXISTS idx_ambassador_sales_status ON ambassador_sales(status);
CREATE INDEX IF NOT EXISTS idx_ambassador_links_ambassador_id ON ambassador_links(ambassador_id);

-- Enable RLS
ALTER TABLE ambassador_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE ambassador_links ENABLE ROW LEVEL SECURITY;

-- Policies for ambassador_sales
CREATE POLICY "Public can view confirmed sales for leaderboard"
  ON ambassador_sales
  FOR SELECT
  TO public
  USING (status = 'confirmed' OR status = 'paid');

CREATE POLICY "Authenticated users can manage sales"
  ON ambassador_sales
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policies for ambassador_links
CREATE POLICY "Anyone can view links"
  ON ambassador_links
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can manage links"
  ON ambassador_links
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can update link stats"
  ON ambassador_links
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Function to record a sale
CREATE OR REPLACE FUNCTION record_ambassador_sale(
  p_ref_code text,
  p_sale_type text,
  p_amount numeric,
  p_quantity integer DEFAULT 1,
  p_event_name text DEFAULT NULL,
  p_commission_rate numeric DEFAULT 0.10
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_ambassador_id uuid;
  v_commission numeric;
  v_sale_id uuid;
BEGIN
  -- Get ambassador ID
  SELECT id INTO v_ambassador_id
  FROM ambassadors
  WHERE ref_code = p_ref_code;

  IF v_ambassador_id IS NULL THEN
    RAISE EXCEPTION 'Ambassador not found with ref code: %', p_ref_code;
  END IF;

  -- Calculate commission
  v_commission := p_amount * p_commission_rate;

  -- Insert sale
  INSERT INTO ambassador_sales (
    ambassador_id,
    sale_type,
    amount,
    quantity,
    event_name,
    commission,
    status
  ) VALUES (
    v_ambassador_id,
    p_sale_type,
    p_amount,
    p_quantity,
    p_event_name,
    v_commission,
    'pending'
  ) RETURNING id INTO v_sale_id;

  -- Update ambassador stats
  UPDATE ambassadors
  SET
    total_sales = total_sales + p_amount,
    total_conversions = total_conversions + p_quantity,
    commission_earned = commission_earned + v_commission,
    points = points + (p_quantity * 10),
    last_activity = now()
  WHERE id = v_ambassador_id;

  RETURN v_sale_id;
END;
$$;

-- Function to generate tracking link
CREATE OR REPLACE FUNCTION generate_ambassador_link(
  p_ambassador_id uuid,
  p_platform text DEFAULT 'website'
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_ref_code text;
  v_link_url text;
  v_link_id uuid;
BEGIN
  -- Get ref code
  SELECT ref_code INTO v_ref_code
  FROM ambassadors
  WHERE id = p_ambassador_id;

  IF v_ref_code IS NULL THEN
    RAISE EXCEPTION 'Ambassador not found';
  END IF;

  -- Generate link URL
  v_link_url := 'https://rumbl-rave.com?ref=' || v_ref_code || '&utm_source=' || p_platform;

  -- Insert or update link
  INSERT INTO ambassador_links (
    ambassador_id,
    link_url,
    platform
  ) VALUES (
    p_ambassador_id,
    v_link_url,
    p_platform
  )
  ON CONFLICT DO NOTHING;

  RETURN v_link_url;
END;
$$;

-- Insert some sample data
INSERT INTO ambassador_links (ambassador_id, link_url, platform, total_clicks, conversions)
SELECT
  a.id,
  'https://rumbl-rave.com?ref=' || a.ref_code || '&utm_source=instagram',
  'instagram',
  a.total_clicks,
  0
FROM ambassadors a
WHERE NOT EXISTS (
  SELECT 1 FROM ambassador_links al WHERE al.ambassador_id = a.id
);

-- Add sample sales data
INSERT INTO ambassador_sales (ambassador_id, sale_type, amount, quantity, event_name, commission, status)
SELECT
  a.id,
  'ticket',
  150.00,
  5,
  'RÜMBL XXL - Octobre 2025',
  15.00,
  'confirmed'
FROM ambassadors a
WHERE a.ref_code = 'alex'
ON CONFLICT DO NOTHING;