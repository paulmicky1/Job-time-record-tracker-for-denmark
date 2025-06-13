/*
  # Create jobs table

  1. New Tables
    - `jobs`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `name` (text, job name)
      - `hourly_rate` (numeric, hourly wage in DKK)
      - `start_date` (date)
      - `description` (text, optional)
      - `is_active` (boolean, default true)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `jobs` table
    - Add policies for authenticated users to manage their own jobs
*/

CREATE TABLE IF NOT EXISTS jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  hourly_rate numeric(10,2) NOT NULL CHECK (hourly_rate > 0),
  start_date date NOT NULL,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own jobs"
  ON jobs
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS jobs_user_id_idx ON jobs(user_id);
CREATE INDEX IF NOT EXISTS jobs_is_active_idx ON jobs(is_active);