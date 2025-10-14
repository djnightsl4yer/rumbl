/*
  # Ambassador Authentication System

  ## Overview
  This migration adds authentication and profile management for ambassadors:
  - Links ambassadors to Supabase auth users
  - Adds profile customization fields
  - Enables ambassadors to manage their own profiles

  ## Schema Changes

  ### ambassadors table updates
  - Add user_id (uuid, foreign key to auth.users) - Links to auth user
  - Add bio (text) - Ambassador bio/description
  - Add profile_image_url (text) - Profile picture URL
  - Add social_links (jsonb) - Social media links
  - Add phone (text) - Contact phone number
  - Add is_verified (boolean) - Verification status
  
  ## Security
  - Ambassadors can only edit their own profiles
  - RLS policies updated for user-specific access
  
  ## Indexes
  - Index on user_id for fast lookups
*/

-- Add new columns to ambassadors table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ambassadors' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE ambassadors ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ambassadors' AND column_name = 'bio'
  ) THEN
    ALTER TABLE ambassadors ADD COLUMN bio text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ambassadors' AND column_name = 'profile_image_url'
  ) THEN
    ALTER TABLE ambassadors ADD COLUMN profile_image_url text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ambassadors' AND column_name = 'social_links'
  ) THEN
    ALTER TABLE ambassadors ADD COLUMN social_links jsonb DEFAULT '{}'::jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ambassadors' AND column_name = 'phone'
  ) THEN
    ALTER TABLE ambassadors ADD COLUMN phone text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ambassadors' AND column_name = 'is_verified'
  ) THEN
    ALTER TABLE ambassadors ADD COLUMN is_verified boolean DEFAULT false;
  END IF;
END $$;

-- Create index on user_id
CREATE INDEX IF NOT EXISTS idx_ambassadors_user_id ON ambassadors(user_id);

-- Update RLS policies for ambassadors
DROP POLICY IF EXISTS "Ambassadors can view own profile" ON ambassadors;
CREATE POLICY "Ambassadors can view own profile"
  ON ambassadors
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR is_active = true);

DROP POLICY IF EXISTS "Ambassadors can update own profile" ON ambassadors;
CREATE POLICY "Ambassadors can update own profile"
  ON ambassadors
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- RLS for ambassador_sales (ambassadors can view their own sales)
DROP POLICY IF EXISTS "Ambassadors can view own sales" ON ambassador_sales;
CREATE POLICY "Ambassadors can view own sales"
  ON ambassador_sales
  FOR SELECT
  TO authenticated
  USING (
    ambassador_id IN (
      SELECT id FROM ambassadors WHERE user_id = auth.uid()
    )
  );

-- RLS for ambassador_links (ambassadors can manage their own links)
DROP POLICY IF EXISTS "Ambassadors can view own links" ON ambassador_links;
CREATE POLICY "Ambassadors can view own links"
  ON ambassador_links
  FOR SELECT
  TO authenticated
  USING (
    ambassador_id IN (
      SELECT id FROM ambassadors WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Ambassadors can insert own links" ON ambassador_links;
CREATE POLICY "Ambassadors can insert own links"
  ON ambassador_links
  FOR INSERT
  TO authenticated
  WITH CHECK (
    ambassador_id IN (
      SELECT id FROM ambassadors WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Ambassadors can update own links" ON ambassador_links;
CREATE POLICY "Ambassadors can update own links"
  ON ambassador_links
  FOR UPDATE
  TO authenticated
  USING (
    ambassador_id IN (
      SELECT id FROM ambassadors WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    ambassador_id IN (
      SELECT id FROM ambassadors WHERE user_id = auth.uid()
    )
  );

-- Function to get ambassador profile by auth user
CREATE OR REPLACE FUNCTION get_my_ambassador_profile()
RETURNS TABLE (
  id uuid,
  name text,
  ref_code text,
  email text,
  instagram_handle text,
  phone text,
  bio text,
  profile_image_url text,
  social_links jsonb,
  points integer,
  total_clicks integer,
  total_sales numeric,
  total_conversions integer,
  commission_earned numeric,
  is_active boolean,
  is_verified boolean,
  created_at timestamptz,
  last_activity timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.id,
    a.name,
    a.ref_code,
    a.email,
    a.instagram_handle,
    a.phone,
    a.bio,
    a.profile_image_url,
    a.social_links,
    a.points,
    a.total_clicks,
    a.total_sales,
    a.total_conversions,
    a.commission_earned,
    a.is_active,
    a.is_verified,
    a.created_at,
    a.last_activity
  FROM ambassadors a
  WHERE a.user_id = auth.uid();
END;
$$;