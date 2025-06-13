/*
  # Create work hours table

  1. New Tables
    - `work_hours`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `job_id` (uuid, foreign key to jobs)
      - `date` (date, work date)
      - `hours_worked` (numeric, hours worked)
      - `description` (text, optional work description)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `work_hours` table
    - Add policies for authenticated users to manage their own work hours
  
  3. Constraints
    - Unique constraint on user_id, job_id, date to prevent duplicate entries
    - Check constraint to ensure hours_worked is between 0 and 24
    - Check constraint to ensure date is not in the future
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist
DROP TABLE IF EXISTS work_hours;
DROP TABLE IF EXISTS jobs;
DROP TABLE IF EXISTS user_profiles;

-- Create user_profiles table
CREATE TABLE user_profiles (
  id uuid REFERENCES auth.users PRIMARY KEY,
  email text NOT NULL,
  full_name text,
  language text DEFAULT 'en',
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create jobs table
CREATE TABLE jobs (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  name text NOT NULL,
  hourly_rate numeric NOT NULL CHECK (hourly_rate > 0),
  start_date date NOT NULL,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create work_hours table
CREATE TABLE work_hours (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  job_id uuid REFERENCES jobs NOT NULL,
  date date NOT NULL,
  hours_worked numeric(5,2) NOT NULL,
  description text,
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT work_hours_hours_check CHECK (hours_worked >= 0 AND hours_worked <= 24),
  CONSTRAINT work_hours_date_check CHECK (date <= CURRENT_DATE),
  CONSTRAINT work_hours_unique_entry UNIQUE(user_id, job_id, date)
);

-- Enable Row Level Security (RLS)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_hours ENABLE ROW LEVEL SECURITY;

-- Create policies for user_profiles
CREATE POLICY "Users can view their own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

-- Create policies for jobs
CREATE POLICY "Users can view their own jobs"
  ON jobs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own jobs"
  ON jobs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own jobs"
  ON jobs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own jobs"
  ON jobs FOR DELETE
  USING (auth.uid() = user_id);

-- Create policies for work_hours
CREATE POLICY "Users can view their own work hours"
  ON work_hours FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own work hours"
  ON work_hours FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own work hours"
  ON work_hours FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own work hours"
  ON work_hours FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX work_hours_user_id_idx ON work_hours(user_id);
CREATE INDEX work_hours_job_id_idx ON work_hours(job_id);
CREATE INDEX work_hours_date_idx ON work_hours(date);
CREATE INDEX work_hours_user_date_idx ON work_hours(user_id, date);

CREATE INDEX jobs_user_id_idx ON jobs(user_id);
CREATE INDEX jobs_is_active_idx ON jobs(is_active);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at
  BEFORE UPDATE ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_work_hours_updated_at
  BEFORE UPDATE ON work_hours
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();