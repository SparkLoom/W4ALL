/*
  # Analytics and Reporting Schema

  1. New Tables
    - `analytics_events` - Tracks user interactions and events
    - `profile_views` - Tracks profile view statistics
    - `salary_insights` - Aggregates salary data for analysis
    - `industry_reports` - Stores generated industry reports
    
  2. Security
    - Enable RLS on all tables
    - Create policies for data access
    
  3. Functions
    - Analytics aggregation functions
    - Report generation functions
*/

-- Create analytics_events table
CREATE TABLE IF NOT EXISTS analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE,
  event_type text NOT NULL,
  event_data jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create profile_views table
CREATE TABLE IF NOT EXISTS profile_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES profiles ON DELETE CASCADE NOT NULL,
  viewer_id uuid REFERENCES auth.users ON DELETE CASCADE,
  source text,
  created_at timestamptz DEFAULT now()
);

-- Create salary_insights table
CREATE TABLE IF NOT EXISTS salary_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  industry text NOT NULL,
  job_title text NOT NULL,
  location text NOT NULL,
  experience_level text NOT NULL,
  avg_salary numeric NOT NULL,
  salary_range_min numeric NOT NULL,
  salary_range_max numeric NOT NULL,
  sample_size integer NOT NULL,
  period text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create industry_reports table
CREATE TABLE IF NOT EXISTS industry_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  industry text NOT NULL,
  report_data jsonb NOT NULL,
  period text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE salary_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE industry_reports ENABLE ROW LEVEL SECURITY;

-- Create policies for analytics_events
CREATE POLICY "Users can view own events"
  ON analytics_events FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create events"
  ON analytics_events FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create policies for profile_views
CREATE POLICY "Users can view own profile views"
  ON profile_views FOR SELECT
  TO authenticated
  USING (profile_id IN (
    SELECT id FROM profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can record profile views"
  ON profile_views FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create policies for salary_insights
CREATE POLICY "Anyone can view salary insights"
  ON salary_insights FOR SELECT
  USING (true);

-- Create policies for industry_reports
CREATE POLICY "Anyone can view industry reports"
  ON industry_reports FOR SELECT
  USING (true);

-- Create function to track profile view
CREATE OR REPLACE FUNCTION track_profile_view(profile_id_param uuid)
RETURNS void AS $$
BEGIN
  INSERT INTO profile_views (profile_id, viewer_id)
  VALUES (profile_id_param, auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get profile analytics
CREATE OR REPLACE FUNCTION get_profile_analytics(profile_id_param uuid)
RETURNS TABLE (
  total_views bigint,
  unique_views bigint,
  views_last_30_days bigint,
  top_viewer_locations text[]
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) as total_views,
    COUNT(DISTINCT viewer_id) as unique_views,
    COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') as views_last_30_days,
    ARRAY(
      SELECT source
      FROM profile_views
      WHERE profile_id = profile_id_param
      GROUP BY source
      ORDER BY COUNT(*) DESC
      LIMIT 5
    ) as top_viewer_locations
  FROM profile_views
  WHERE profile_id = profile_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to generate industry report
CREATE OR REPLACE FUNCTION generate_industry_report(industry_param text)
RETURNS uuid AS $$
DECLARE
  new_report_id uuid;
BEGIN
  INSERT INTO industry_reports (
    title,
    industry,
    report_data,
    period
  )
  VALUES (
    industry_param || ' Industry Report - ' || TO_CHAR(NOW(), 'YYYY-MM'),
    industry_param,
    jsonb_build_object(
      'total_companies', (
        SELECT COUNT(*)
        FROM companies
        WHERE industry = industry_param
      ),
      'total_jobs', (
        SELECT COUNT(*)
        FROM job_posts
        WHERE status = 'active'
      ),
      'avg_salary', (
        SELECT AVG(avg_salary)
        FROM salary_insights
        WHERE industry = industry_param
      ),
      'top_skills', (
        SELECT jsonb_agg(skill)
        FROM (
          SELECT skill, COUNT(*) as count
          FROM job_posts,
          jsonb_array_elements_text(requirements::jsonb) as skill
          GROUP BY skill
          ORDER BY count DESC
          LIMIT 10
        ) s
      ),
      'hiring_trends', (
        SELECT jsonb_object_agg(month, count)
        FROM (
          SELECT 
            TO_CHAR(created_at, 'YYYY-MM') as month,
            COUNT(*) as count
          FROM job_posts
          WHERE created_at >= NOW() - INTERVAL '6 months'
          GROUP BY month
          ORDER BY month
        ) t
      )
    ),
    TO_CHAR(NOW(), 'YYYY-MM')
  )
  RETURNING id INTO new_report_id;

  RETURN new_report_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;