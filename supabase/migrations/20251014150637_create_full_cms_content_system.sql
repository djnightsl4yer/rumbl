/*
  # Complete CMS Content Management System

  ## Overview
  Creates a comprehensive content management system allowing admins to:
  - Manage artists (add, edit, delete)
  - Manage events (add, edit, delete)
  - Create custom sections
  - Upload and manage images
  - Control all site content dynamically

  ## New Tables

  ### artists
  - id (uuid, primary key)
  - name (text) - Artist name
  - slug (text, unique) - URL-friendly name
  - bio (text) - Artist biography
  - image_url (text) - Profile image
  - role (text) - DJ, Producer, etc.
  - instagram (text)
  - soundcloud (text)
  - spotify (text)
  - website (text)
  - is_active (boolean) - Show on site
  - order_index (integer) - Display order
  - created_at (timestamptz)
  - updated_at (timestamptz)

  ### events
  - id (uuid, primary key)
  - title (text) - Event name
  - slug (text, unique) - URL-friendly name
  - description (text) - Event description
  - event_date (timestamptz) - When the event happens
  - location (text) - Venue name
  - address (text) - Full address
  - image_url (text) - Event poster/image
  - ticket_url (text) - Shotgun/ticket link
  - price (text) - Price info
  - lineup (jsonb) - Array of artist IDs/names
  - status (text) - upcoming, past, cancelled
  - is_featured (boolean) - Show on homepage
  - created_at (timestamptz)
  - updated_at (timestamptz)

  ### media_library
  - id (uuid, primary key)
  - filename (text)
  - url (text)
  - type (text) - image, video, document
  - size (bigint)
  - uploaded_by (uuid)
  - created_at (timestamptz)

  ### dynamic_sections
  - id (uuid, primary key)
  - page (text) - Which page (home, about, etc.)
  - section_type (text) - hero, gallery, text, video, etc.
  - title (text)
  - content (jsonb) - Flexible content
  - order_index (integer)
  - is_active (boolean)
  - created_at (timestamptz)
  - updated_at (timestamptz)

  ## Security
  - RLS enabled on all tables
  - Public can read active content
  - Only authenticated users can modify
*/

-- Artists table
CREATE TABLE IF NOT EXISTS artists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  bio text,
  image_url text,
  role text DEFAULT 'DJ',
  instagram text,
  soundcloud text,
  spotify text,
  website text,
  is_active boolean DEFAULT true,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Events table
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  event_date timestamptz,
  location text,
  address text,
  image_url text,
  ticket_url text,
  price text,
  lineup jsonb DEFAULT '[]'::jsonb,
  status text DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'past', 'cancelled')),
  is_featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Media library table
CREATE TABLE IF NOT EXISTS media_library (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  filename text NOT NULL,
  url text NOT NULL,
  type text DEFAULT 'image' CHECK (type IN ('image', 'video', 'document')),
  size bigint,
  uploaded_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- Dynamic sections table
CREATE TABLE IF NOT EXISTS dynamic_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page text NOT NULL,
  section_type text NOT NULL,
  title text,
  content jsonb DEFAULT '{}'::jsonb,
  order_index integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_artists_slug ON artists(slug);
CREATE INDEX IF NOT EXISTS idx_artists_is_active ON artists(is_active);
CREATE INDEX IF NOT EXISTS idx_artists_order ON artists(order_index);
CREATE INDEX IF NOT EXISTS idx_events_slug ON events(slug);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date DESC);
CREATE INDEX IF NOT EXISTS idx_events_featured ON events(is_featured);
CREATE INDEX IF NOT EXISTS idx_media_type ON media_library(type);
CREATE INDEX IF NOT EXISTS idx_sections_page ON dynamic_sections(page);
CREATE INDEX IF NOT EXISTS idx_sections_order ON dynamic_sections(order_index);

-- Enable RLS
ALTER TABLE artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE dynamic_sections ENABLE ROW LEVEL SECURITY;

-- Policies for artists
CREATE POLICY "Public can view active artists"
  ON artists
  FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Authenticated users can manage artists"
  ON artists
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policies for events
CREATE POLICY "Public can view events"
  ON events
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can manage events"
  ON events
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policies for media library
CREATE POLICY "Public can view media"
  ON media_library
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can manage media"
  ON media_library
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policies for dynamic sections
CREATE POLICY "Public can view active sections"
  ON dynamic_sections
  FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Authenticated users can manage sections"
  ON dynamic_sections
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Insert sample artists
INSERT INTO artists (name, slug, bio, role, image_url, instagram, order_index) VALUES
  ('CDJ YUGI', 'cdj-yugi', 'Maître des platines, spécialiste hard techno', 'DJ/Producer', '/cdj yugi.jpg', '@cdj_yugi', 1),
  ('DJ EPICURIEN', 'dj-epicurien', 'Le roi du groovy techno', 'DJ', '/DJEPICURIEN.jpg', '@djepicurien', 2),
  ('VIRVOLTEK', 'virvoltek', 'Techno industriel et beats implacables', 'DJ/Producer', '/VIRVOLTEK.jpg', '@virvoltek', 3)
ON CONFLICT (slug) DO NOTHING;

-- Insert sample events
INSERT INTO events (title, slug, description, event_date, location, ticket_url, status, is_featured) VALUES
  ('RÜMBL - TBA', 'rumbl-tba', 'Prochain événement à venir', now() + interval '30 days', 'Lieu à confirmer', 'https://shotgun.live/venues/rumbl-rave', 'upcoming', true)
ON CONFLICT (slug) DO NOTHING;

-- Function to generate slug from name
CREATE OR REPLACE FUNCTION generate_slug(input_text text)
RETURNS text
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN lower(regexp_replace(
    regexp_replace(input_text, '[^a-zA-Z0-9\s-]', '', 'g'),
    '\s+', '-', 'g'
  ));
END;
$$;

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_artists_updated_at
  BEFORE UPDATE ON artists
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sections_updated_at
  BEFORE UPDATE ON dynamic_sections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();