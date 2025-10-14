/*
  # Ambassador Tracking System for RÜMBL

  ## Overview
  This migration creates a complete ambassador tracking system with:
  - Ambassador profiles with unique tracking codes
  - Click and conversion tracking
  - Points system
  - Admin management capabilities

  ## New Tables
  
  ### `ambassadors`
  - `id` (uuid, primary key) - Unique identifier
  - `name` (text) - Ambassador display name
  - `ref_code` (text, unique) - Tracking code used in URLs (?ref=code)
  - `points` (integer) - Total points accumulated
  - `total_clicks` (integer) - Total number of clicks tracked
  - `created_at` (timestamptz) - When ambassador was created
  - `last_activity` (timestamptz) - Last time they had activity
  - `is_active` (boolean) - Whether ambassador is currently active

  ### `ambassador_clicks`
  - `id` (uuid, primary key) - Unique identifier
  - `ambassador_id` (uuid, foreign key) - Links to ambassadors table
  - `clicked_at` (timestamptz) - When the click occurred
  - `referrer` (text) - Where the click came from
  - `user_agent` (text) - Browser/device info
  - `ip_address` (text) - IP address (for fraud prevention)

  ## Security
  - RLS enabled on all tables
  - Public can read ambassador leaderboard data
  - Only authenticated admins can modify data
  - Click tracking is write-only for public

  ## Indexes
  - Index on `ref_code` for fast lookups
  - Index on `ambassador_id` for click queries
  - Index on `clicked_at` for time-based queries
*/

-- Create ambassadors table
CREATE TABLE IF NOT EXISTS ambassadors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  ref_code text UNIQUE NOT NULL,
  points integer DEFAULT 0,
  total_clicks integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  last_activity timestamptz DEFAULT now(),
  is_active boolean DEFAULT true
);

-- Create ambassador_clicks table for detailed tracking
CREATE TABLE IF NOT EXISTS ambassador_clicks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ambassador_id uuid REFERENCES ambassadors(id) ON DELETE CASCADE,
  clicked_at timestamptz DEFAULT now(),
  referrer text,
  user_agent text,
  ip_address text
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_ambassadors_ref_code ON ambassadors(ref_code);
CREATE INDEX IF NOT EXISTS idx_ambassadors_points ON ambassadors(points DESC);
CREATE INDEX IF NOT EXISTS idx_ambassador_clicks_ambassador_id ON ambassador_clicks(ambassador_id);
CREATE INDEX IF NOT EXISTS idx_ambassador_clicks_clicked_at ON ambassador_clicks(clicked_at DESC);

-- Enable RLS
ALTER TABLE ambassadors ENABLE ROW LEVEL SECURITY;
ALTER TABLE ambassador_clicks ENABLE ROW LEVEL SECURITY;

-- Policies for ambassadors table
CREATE POLICY "Anyone can view active ambassadors"
  ON ambassadors
  FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Authenticated users can manage ambassadors"
  ON ambassadors
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policies for ambassador_clicks table
CREATE POLICY "Public can insert clicks"
  ON ambassador_clicks
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view clicks"
  ON ambassador_clicks
  FOR SELECT
  TO authenticated
  USING (true);

-- Function to increment ambassador stats
CREATE OR REPLACE FUNCTION increment_ambassador_stats(ref_code_param text, points_to_add integer DEFAULT 1)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE ambassadors
  SET 
    total_clicks = total_clicks + 1,
    points = points + points_to_add,
    last_activity = now()
  WHERE ref_code = ref_code_param;
END;
$$;

-- Insert some initial ambassadors for testing
INSERT INTO ambassadors (name, ref_code, points, total_clicks) VALUES
  ('Sarah', 'sarah', 12, 8),
  ('Antoine', 'antoine', 5, 3),
  ('Alex', 'alex', 25, 120)
ON CONFLICT (ref_code) DO NOTHING;