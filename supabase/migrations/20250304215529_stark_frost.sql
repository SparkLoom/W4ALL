/*
  # Profile & Resume Features

  1. New Tables
    - `portfolio_projects`
      - Project showcase entries linked to user profiles
    - `endorsements`
      - Skill endorsements from other users
    - `user_connections`
      - Professional networking connections between users

  2. Security
    - Enable RLS on all new tables
    - Add policies for authenticated users
*/

-- Create portfolio_projects table
CREATE TABLE IF NOT EXISTS portfolio_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  image_url text,
  technologies text[] NOT NULL,
  live_url text,
  github_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create endorsements table
CREATE TABLE IF NOT EXISTS endorsements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  endorser_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  endorsed_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  skill text NOT NULL,
  comment text NOT NULL,
  relationship text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(endorser_id, endorsed_id, skill)
);

-- Create user_connections table
CREATE TABLE IF NOT EXISTS user_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  receiver_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  status text NOT NULL CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(requester_id, receiver_id)
);

-- Enable Row Level Security
ALTER TABLE portfolio_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE endorsements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_connections ENABLE ROW LEVEL SECURITY;

-- Create policies for portfolio_projects
CREATE POLICY "Users can view all portfolio projects"
  ON portfolio_projects FOR SELECT
  USING (true);

CREATE POLICY "Users can manage own portfolio projects"
  ON portfolio_projects FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create policies for endorsements
CREATE POLICY "Anyone can view endorsements"
  ON endorsements FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create endorsements"
  ON endorsements FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = endorser_id);

CREATE POLICY "Users can delete own endorsements"
  ON endorsements FOR DELETE
  TO authenticated
  USING (auth.uid() = endorser_id);

-- Create policies for user_connections
CREATE POLICY "Users can view own connections"
  ON user_connections FOR SELECT
  TO authenticated
  USING (auth.uid() IN (requester_id, receiver_id));

CREATE POLICY "Users can create connection requests"
  ON user_connections FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Users can update own connection requests"
  ON user_connections FOR UPDATE
  TO authenticated
  USING (auth.uid() IN (requester_id, receiver_id))
  WITH CHECK (auth.uid() IN (requester_id, receiver_id));

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at columns
CREATE TRIGGER set_portfolio_projects_updated_at
  BEFORE UPDATE ON portfolio_projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_user_connections_updated_at
  BEFORE UPDATE ON user_connections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();