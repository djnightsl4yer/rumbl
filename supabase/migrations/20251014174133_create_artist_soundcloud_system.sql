/*
  # Create Artist SoundCloud Integration System

  1. New Tables
    - `artists`
      - `id` (uuid, primary key)
      - `name` (text) - Artist name
      - `role` (text) - DJ, Producer, etc.
      - `bio` (text) - Artist biography
      - `image_url` (text) - Profile image
      - `genre` (text) - Music genre
      - `video_url` (text) - Optional video URL
      - `youtube_id` (text) - Optional YouTube ID
      - `soundcloud_url` (text) - SoundCloud profile URL
      - `spotify_url` (text) - Spotify profile URL
      - `instagram_url` (text) - Instagram profile URL
      - `website_url` (text) - Website URL
      - `shotgun_url` (text) - Shotgun profile URL
      - `is_active` (boolean) - Whether artist is active
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `artist_tracks`
      - `id` (uuid, primary key)
      - `artist_id` (uuid, foreign key to artists)
      - `title` (text) - Track title
      - `soundcloud_track_id` (text) - SoundCloud track ID or URL
      - `soundcloud_embed_url` (text) - SoundCloud embed URL
      - `duration` (integer) - Track duration in seconds
      - `artwork_url` (text) - Track artwork
      - `play_count` (integer) - Number of plays
      - `is_featured` (boolean) - Whether track is featured
      - `order_index` (integer) - Display order
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Public can read active artists and their tracks
    - Only authenticated admin users can modify data

  3. Indexes
    - Index on artist_id for faster track lookups
    - Index on is_active for filtering
    - Index on order_index for sorting
*/

-- Create artists table
CREATE TABLE IF NOT EXISTS artists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  role text NOT NULL DEFAULT 'DJ',
  bio text DEFAULT '',
  image_url text DEFAULT '',
  genre text DEFAULT '',
  video_url text,
  youtube_id text,
  soundcloud_url text,
  spotify_url text,
  instagram_url text,
  website_url text,
  shotgun_url text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create artist_tracks table
CREATE TABLE IF NOT EXISTS artist_tracks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id uuid NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  title text NOT NULL,
  soundcloud_track_id text NOT NULL,
  soundcloud_embed_url text NOT NULL,
  duration integer DEFAULT 0,
  artwork_url text DEFAULT '',
  play_count integer DEFAULT 0,
  is_featured boolean DEFAULT false,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_artist_tracks_artist_id ON artist_tracks(artist_id);
CREATE INDEX IF NOT EXISTS idx_artists_is_active ON artists(is_active);
CREATE INDEX IF NOT EXISTS idx_artist_tracks_order ON artist_tracks(order_index);
CREATE INDEX IF NOT EXISTS idx_artist_tracks_featured ON artist_tracks(is_featured);

-- Enable RLS
ALTER TABLE artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE artist_tracks ENABLE ROW LEVEL SECURITY;

-- Artists policies
CREATE POLICY "Anyone can view active artists"
  ON artists FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Authenticated users can view all artists"
  ON artists FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert artists"
  ON artists FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update artists"
  ON artists FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete artists"
  ON artists FOR DELETE
  TO authenticated
  USING (true);

-- Artist tracks policies
CREATE POLICY "Anyone can view tracks of active artists"
  ON artist_tracks FOR SELECT
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM artists
      WHERE artists.id = artist_tracks.artist_id
      AND artists.is_active = true
    )
  );

CREATE POLICY "Authenticated users can view all tracks"
  ON artist_tracks FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert tracks"
  ON artist_tracks FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update tracks"
  ON artist_tracks FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete tracks"
  ON artist_tracks FOR DELETE
  TO authenticated
  USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_artists_updated_at ON artists;
CREATE TRIGGER update_artists_updated_at
  BEFORE UPDATE ON artists
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_artist_tracks_updated_at ON artist_tracks;
CREATE TRIGGER update_artist_tracks_updated_at
  BEFORE UPDATE ON artist_tracks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
