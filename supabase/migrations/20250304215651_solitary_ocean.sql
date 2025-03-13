/*
  # Company Features Update

  1. New Tables
    - `company_interview_reviews`
      - Interview experience reviews
    - `company_salaries`
      - Salary insights and comparisons
    - `company_followers`
      - Company follow/subscription feature

  2. Security
    - Enable RLS on all new tables
    - Add policies for authenticated users
*/

-- Create company_interview_reviews table
CREATE TABLE IF NOT EXISTS company_interview_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  job_title text NOT NULL,
  interview_date date NOT NULL,
  difficulty_rating integer NOT NULL CHECK (difficulty_rating >= 1 AND difficulty_rating <= 5),
  process_description text NOT NULL,
  questions text[] NOT NULL,
  duration text NOT NULL,
  interview_type text NOT NULL CHECK (interview_type IN ('in-person', 'phone', 'video', 'technical', 'group')),
  offer_status text NOT NULL CHECK (offer_status IN ('accepted', 'rejected', 'pending', 'declined')),
  preparation_tips text,
  pros text,
  cons text,
  overall_experience text NOT NULL CHECK (overall_experience IN ('positive', 'neutral', 'negative')),
  helpful_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(company_id, user_id, interview_date)
);

-- Create company_salaries table
CREATE TABLE IF NOT EXISTS company_salaries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  job_title text NOT NULL,
  salary_type text NOT NULL CHECK (salary_type IN ('yearly', 'monthly', 'hourly')),
  base_salary integer NOT NULL,
  bonus integer,
  stock_options integer,
  benefits text[],
  years_of_experience integer NOT NULL,
  location text NOT NULL,
  employment_type text NOT NULL CHECK (employment_type IN ('full-time', 'part-time', 'contract', 'internship')),
  is_current_employee boolean DEFAULT false,
  end_date date,
  created_at timestamptz DEFAULT now(),
  UNIQUE(company_id, user_id, job_title, end_date)
);

-- Create company_followers table
CREATE TABLE IF NOT EXISTS company_followers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  notification_preferences jsonb DEFAULT '{"job_posts": true, "company_updates": true}'::jsonb,
  created_at timestamptz DEFAULT now(),
  UNIQUE(company_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE company_interview_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_salaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_followers ENABLE ROW LEVEL SECURITY;

-- Create policies for company_interview_reviews
CREATE POLICY "Anyone can view interview reviews"
  ON company_interview_reviews FOR SELECT
  USING (true);

CREATE POLICY "Users can create interview reviews"
  ON company_interview_reviews FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own interview reviews"
  ON company_interview_reviews FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own interview reviews"
  ON company_interview_reviews FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for company_salaries
CREATE POLICY "Anyone can view salary data"
  ON company_salaries FOR SELECT
  USING (true);

CREATE POLICY "Users can create salary entries"
  ON company_salaries FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own salary entries"
  ON company_salaries FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own salary entries"
  ON company_salaries FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for company_followers
CREATE POLICY "Users can view own follows"
  ON company_followers FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can follow companies"
  ON company_followers FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own follow preferences"
  ON company_followers FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unfollow companies"
  ON company_followers FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create function to increment helpful count
CREATE OR REPLACE FUNCTION increment_helpful_count(review_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE company_interview_reviews
  SET helpful_count = helpful_count + 1
  WHERE id = review_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to calculate average salary
CREATE OR REPLACE FUNCTION get_average_salary(company_id_param uuid, job_title_param text)
RETURNS TABLE (
  avg_base_salary numeric,
  avg_total_compensation numeric,
  salary_range_min integer,
  salary_range_max integer,
  sample_size integer
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ROUND(AVG(base_salary)::numeric, 2) as avg_base_salary,
    ROUND(AVG(base_salary + COALESCE(bonus, 0) + COALESCE(stock_options, 0))::numeric, 2) as avg_total_compensation,
    MIN(base_salary) as salary_range_min,
    MAX(base_salary) as salary_range_max,
    COUNT(*) as sample_size
  FROM company_salaries
  WHERE company_id = company_id_param
    AND job_title = job_title_param
    AND created_at >= NOW() - INTERVAL '2 years';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get company stats
CREATE OR REPLACE FUNCTION get_company_stats(company_id_param uuid)
RETURNS TABLE (
  total_reviews integer,
  avg_rating numeric,
  total_salaries integer,
  total_interviews integer,
  followers_count integer
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM company_reviews WHERE company_id = company_id_param) as total_reviews,
    (SELECT ROUND(AVG(rating)::numeric, 1) FROM company_reviews WHERE company_id = company_id_param) as avg_rating,
    (SELECT COUNT(*) FROM company_salaries WHERE company_id = company_id_param) as total_salaries,
    (SELECT COUNT(*) FROM company_interview_reviews WHERE company_id = company_id_param) as total_interviews,
    (SELECT COUNT(*) FROM company_followers WHERE company_id = company_id_param) as followers_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;