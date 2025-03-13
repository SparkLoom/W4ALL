/*
  # Add saved jobs functionality

  1. New Tables
    - `saved_jobs`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `job_id` (uuid, references job_posts)
      - `created_at` (timestamp)
  
  2. Security
    - Enable RLS on `saved_jobs` table
    - Add policies for users to manage their saved jobs
*/

-- Create saved_jobs table
CREATE TABLE IF NOT EXISTS saved_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  job_id uuid REFERENCES job_posts ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, job_id)
);

-- Enable Row Level Security
ALTER TABLE saved_jobs ENABLE ROW LEVEL SECURITY;

-- Create policies for saved_jobs
CREATE POLICY "Users can view their own saved jobs"
  ON saved_jobs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can save jobs"
  ON saved_jobs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved jobs"
  ON saved_jobs FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);