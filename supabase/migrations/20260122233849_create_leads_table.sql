/*
  # Create leads table for NuisiblesExpress

  1. New Tables
    - `leads`
      - `id` (uuid, primary key) - Unique identifier for each lead
      - `created_at` (timestamptz) - Timestamp when lead was created
      - `language` (text) - Language preference (nl or fr)
      - `pest_type` (text) - Type of pest issue (wasps, rats, cockroaches, other)
      - `contact_method` (text) - How they contacted (phone or whatsapp)
      - `ip_address` (text) - IP address of visitor for analytics
      - `user_agent` (text) - Browser user agent for analytics
      
  2. Security
    - Enable RLS on `leads` table
    - Add policy for service role to insert leads (public form submissions)
    
  3. Indexes
    - Index on created_at for efficient date-based queries
    - Index on pest_type for analytics
*/

CREATE TABLE IF NOT EXISTS leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  language text NOT NULL DEFAULT 'nl',
  pest_type text,
  contact_method text NOT NULL,
  ip_address text,
  user_agent text
);

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public to insert leads"
  ON leads
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Service role can read all leads"
  ON leads
  FOR SELECT
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS leads_created_at_idx ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS leads_pest_type_idx ON leads(pest_type);
CREATE INDEX IF NOT EXISTS leads_language_idx ON leads(language);