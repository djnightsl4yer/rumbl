/*
  # Forms and Contact System for RÜMBL

  ## Overview
  This migration creates tables to store all form submissions from the RÜMBL website:
  - Contact/Booking requests
  - Ambassador applications
  - General inquiries

  ## New Tables

  ### `contact_submissions`
  - `id` (uuid, primary key) - Unique identifier
  - `first_name` (text) - First name of sender
  - `last_name` (text) - Last name of sender
  - `email` (text) - Contact email
  - `subject` (text) - Subject of inquiry (booking-artist, booking-collective, partnership, other)
  - `concerned_artist` (text) - Artist or project name if applicable
  - `message` (text) - Main message content
  - `status` (text) - Status: new, read, replied, archived
  - `created_at` (timestamptz) - When submission was received
  - `ip_address` (text) - IP for spam prevention
  - `user_agent` (text) - Browser info

  ### `ambassador_applications`
  - `id` (uuid, primary key) - Unique identifier
  - `first_name` (text) - Applicant's first name
  - `last_name` (text) - Applicant's last name
  - `email` (text) - Contact email
  - `instagram` (text) - Instagram handle
  - `motivation` (text) - Why they want to be an ambassador
  - `experience` (text) - Previous experience
  - `availability` (text) - Availability details
  - `status` (text) - Status: pending, approved, rejected
  - `created_at` (timestamptz) - When application was submitted
  - `reviewed_at` (timestamptz) - When admin reviewed
  - `notes` (text) - Admin notes

  ## Security
  - RLS enabled on all tables
  - Public can insert (submit forms)
  - Only authenticated users can read/update (admins)
  
  ## Indexes
  - Index on email for quick lookups
  - Index on status for filtering
  - Index on created_at for sorting
*/

-- Create contact_submissions table
CREATE TABLE IF NOT EXISTS contact_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  subject text NOT NULL,
  concerned_artist text,
  message text NOT NULL,
  status text DEFAULT 'new',
  created_at timestamptz DEFAULT now(),
  ip_address text,
  user_agent text
);

-- Create ambassador_applications table
CREATE TABLE IF NOT EXISTS ambassador_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  instagram text NOT NULL,
  motivation text NOT NULL,
  experience text NOT NULL,
  availability text NOT NULL,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  reviewed_at timestamptz,
  notes text
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_contact_submissions_email ON contact_submissions(email);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_status ON contact_submissions(status);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at ON contact_submissions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ambassador_applications_email ON ambassador_applications(email);
CREATE INDEX IF NOT EXISTS idx_ambassador_applications_status ON ambassador_applications(status);
CREATE INDEX IF NOT EXISTS idx_ambassador_applications_created_at ON ambassador_applications(created_at DESC);

-- Enable RLS
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ambassador_applications ENABLE ROW LEVEL SECURITY;

-- Policies for contact_submissions
CREATE POLICY "Anyone can submit contact forms"
  ON contact_submissions
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view submissions"
  ON contact_submissions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update submissions"
  ON contact_submissions
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policies for ambassador_applications
CREATE POLICY "Anyone can submit ambassador applications"
  ON ambassador_applications
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view applications"
  ON ambassador_applications
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update applications"
  ON ambassador_applications
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);