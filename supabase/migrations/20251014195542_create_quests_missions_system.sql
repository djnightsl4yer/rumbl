/*
  # Create Quests and Missions System for Ambassadors

  1. New Tables
    - `quests`
      - `id` (uuid, primary key)
      - `title` (text) - Quest title
      - `description` (text) - Quest description
      - `points` (integer) - Points awarded for completion
      - `icon` (text) - Icon emoji or identifier
      - `status` (text) - 'active' or 'inactive'
      - `created_at` (timestamptz)
      - `created_by` (uuid) - Admin who created it
      
    - `quest_submissions`
      - `id` (uuid, primary key)
      - `quest_id` (uuid, foreign key to quests)
      - `ambassador_id` (uuid, foreign key to ambassadors)
      - `proof_urls` (text array) - Screenshot URLs
      - `status` (text) - 'pending', 'approved', 'rejected'
      - `submitted_at` (timestamptz)
      - `reviewed_at` (timestamptz)
      - `reviewed_by` (uuid) - Admin who reviewed
      - `review_notes` (text)

    - `ambassador_points`
      - `id` (uuid, primary key)
      - `ambassador_id` (uuid, foreign key to ambassadors)
      - `points` (integer) - Total points
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Ambassadors can view active quests
    - Ambassadors can submit to quests
    - Ambassadors can view their own submissions
    - Ambassadors can view their own points
*/

-- Create quests table
CREATE TABLE IF NOT EXISTS quests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  points integer NOT NULL DEFAULT 0,
  icon text DEFAULT '🎯',
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

ALTER TABLE quests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active quests"
  ON quests FOR SELECT
  USING (status = 'active');

CREATE POLICY "Authenticated users can manage quests"
  ON quests FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create quest_submissions table
CREATE TABLE IF NOT EXISTS quest_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quest_id uuid NOT NULL REFERENCES quests(id) ON DELETE CASCADE,
  ambassador_id uuid NOT NULL REFERENCES ambassadors(id) ON DELETE CASCADE,
  proof_urls text[] DEFAULT ARRAY[]::text[],
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  submitted_at timestamptz DEFAULT now(),
  reviewed_at timestamptz,
  reviewed_by uuid REFERENCES auth.users(id),
  review_notes text
);

ALTER TABLE quest_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ambassadors can view own submissions"
  ON quest_submissions FOR SELECT
  TO authenticated
  USING (
    ambassador_id IN (
      SELECT id FROM ambassadors WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Ambassadors can insert submissions"
  ON quest_submissions FOR INSERT
  TO authenticated
  WITH CHECK (
    ambassador_id IN (
      SELECT id FROM ambassadors WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can view all submissions"
  ON quest_submissions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update submissions"
  ON quest_submissions FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create ambassador_points table
CREATE TABLE IF NOT EXISTS ambassador_points (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ambassador_id uuid NOT NULL UNIQUE REFERENCES ambassadors(id) ON DELETE CASCADE,
  points integer NOT NULL DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE ambassador_points ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ambassadors can view own points"
  ON ambassador_points FOR SELECT
  TO authenticated
  USING (
    ambassador_id IN (
      SELECT id FROM ambassadors WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can view all points"
  ON ambassador_points FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update points"
  ON ambassador_points FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "System can insert points"
  ON ambassador_points FOR INSERT
  WITH CHECK (true);

-- Create function to auto-create points record for new ambassadors
CREATE OR REPLACE FUNCTION create_ambassador_points()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO ambassador_points (ambassador_id, points)
  VALUES (NEW.id, 0)
  ON CONFLICT (ambassador_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new ambassadors
DROP TRIGGER IF EXISTS on_ambassador_created ON ambassadors;
CREATE TRIGGER on_ambassador_created
  AFTER INSERT ON ambassadors
  FOR EACH ROW
  EXECUTE FUNCTION create_ambassador_points();

-- Create function to update points when submission is approved
CREATE OR REPLACE FUNCTION update_ambassador_points_on_approval()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'approved' AND OLD.status = 'pending' THEN
    UPDATE ambassador_points
    SET 
      points = points + (SELECT points FROM quests WHERE id = NEW.quest_id),
      updated_at = now()
    WHERE ambassador_id = NEW.ambassador_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for submission approval
DROP TRIGGER IF EXISTS on_quest_submission_approved ON quest_submissions;
CREATE TRIGGER on_quest_submission_approved
  AFTER UPDATE ON quest_submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_ambassador_points_on_approval();