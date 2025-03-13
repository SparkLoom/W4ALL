-- Create employer_profiles table
CREATE TABLE IF NOT EXISTS employer_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  company_id uuid REFERENCES companies ON DELETE CASCADE NOT NULL,
  role text NOT NULL,
  department text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, company_id)
);

-- Create interviews table
CREATE TABLE IF NOT EXISTS interviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid REFERENCES applications ON DELETE CASCADE NOT NULL,
  employer_id uuid REFERENCES employer_profiles ON DELETE CASCADE NOT NULL,
  scheduled_at timestamptz NOT NULL,
  duration_minutes integer NOT NULL,
  location text NOT NULL,
  type text NOT NULL CHECK (type IN ('in-person', 'video', 'phone')),
  status text NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'rescheduled')),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create job_analytics table
CREATE TABLE IF NOT EXISTS job_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid REFERENCES job_posts ON DELETE CASCADE NOT NULL,
  views integer DEFAULT 0,
  applications integer DEFAULT 0,
  shares integer DEFAULT 0,
  saves integer DEFAULT 0,
  date date NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(job_id, date)
);

-- Enable Row Level Security
ALTER TABLE employer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_analytics ENABLE ROW LEVEL SECURITY;

-- Create policies for employer_profiles
CREATE POLICY "Employers can view own profile"
  ON employer_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Employers can update own profile"
  ON employer_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create policies for interviews
CREATE POLICY "Employers can view interviews they created"
  ON interviews FOR SELECT
  TO authenticated
  USING (employer_id IN (
    SELECT id FROM employer_profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Employers can create interviews"
  ON interviews FOR INSERT
  TO authenticated
  WITH CHECK (employer_id IN (
    SELECT id FROM employer_profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Employers can update interviews they created"
  ON interviews FOR UPDATE
  TO authenticated
  USING (employer_id IN (
    SELECT id FROM employer_profiles WHERE user_id = auth.uid()
  ))
  WITH CHECK (employer_id IN (
    SELECT id FROM employer_profiles WHERE user_id = auth.uid()
  ));

-- Create policies for job_analytics
CREATE POLICY "Employers can view analytics for their company's jobs"
  ON job_analytics FOR SELECT
  TO authenticated
  USING (job_id IN (
    SELECT id FROM job_posts WHERE company IN (
      SELECT c.name FROM companies c
      INNER JOIN employer_profiles ep ON ep.company_id = c.id
      WHERE ep.user_id = auth.uid()
    )
  ));

-- Create function to update analytics
CREATE OR REPLACE FUNCTION increment_job_analytics(
  job_id_param uuid,
  metric text
) RETURNS void AS $$
DECLARE
  current_date_var date := current_date;
BEGIN
  INSERT INTO job_analytics (job_id, date)
  VALUES (job_id_param, current_date_var)
  ON CONFLICT (job_id, date) DO NOTHING;

  CASE metric
    WHEN 'view' THEN
      UPDATE job_analytics
      SET views = views + 1,
          updated_at = now()
      WHERE job_id = job_id_param
      AND date = current_date_var;
    WHEN 'application' THEN
      UPDATE job_analytics
      SET applications = applications + 1,
          updated_at = now()
      WHERE job_id = job_id_param
      AND date = current_date_var;
    WHEN 'share' THEN
      UPDATE job_analytics
      SET shares = shares + 1,
          updated_at = now()
      WHERE job_id = job_id_param
      AND date = current_date_var;
    WHEN 'save' THEN
      UPDATE job_analytics
      SET saves = saves + 1,
          updated_at = now()
      WHERE job_id = job_id_param
      AND date = current_date_var;
    ELSE
      RAISE EXCEPTION 'Invalid metric: %', metric;
  END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to track applications
CREATE OR REPLACE FUNCTION track_new_application()
RETURNS trigger AS $$
BEGIN
  PERFORM increment_job_analytics(NEW.job_id, 'application');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_application_created
  AFTER INSERT ON applications
  FOR EACH ROW
  EXECUTE FUNCTION track_new_application();

-- Create trigger to track saved jobs
CREATE OR REPLACE FUNCTION track_saved_job()
RETURNS trigger AS $$
BEGIN
  PERFORM increment_job_analytics(NEW.job_id, 'save');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_job_saved
  AFTER INSERT ON saved_jobs
  FOR EACH ROW
  EXECUTE FUNCTION track_saved_job();