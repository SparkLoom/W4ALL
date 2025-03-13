/*
  # Learning & Development Schema

  1. New Tables
    - `courses` - Online courses and learning materials
    - `course_enrollments` - User course enrollments and progress
    - `career_resources` - Career development resources and articles
    - `mentorship_programs` - Mentorship program listings
    - `mentorship_applications` - Mentorship program applications
    - `webinars` - Professional webinars and events
    
  2. Security
    - Enable RLS on all tables
    - Create policies for data access
    
  3. Functions
    - Course progress tracking
    - Mentorship matching
*/

-- Create courses table
CREATE TABLE IF NOT EXISTS courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  instructor text NOT NULL,
  level text NOT NULL CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  duration_hours integer NOT NULL,
  topics text[] NOT NULL,
  requirements text[],
  objectives text[],
  price numeric,
  image_url text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create course_enrollments table
CREATE TABLE IF NOT EXISTS course_enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  course_id uuid REFERENCES courses ON DELETE CASCADE NOT NULL,
  progress integer DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  status text NOT NULL DEFAULT 'in_progress' CHECK (status IN ('not_started', 'in_progress', 'completed', 'dropped')),
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  last_activity_at timestamptz DEFAULT now(),
  notes text,
  UNIQUE(user_id, course_id)
);

-- Create career_resources table
CREATE TABLE IF NOT EXISTS career_resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  content text NOT NULL,
  category text NOT NULL,
  tags text[],
  author text NOT NULL,
  image_url text,
  external_url text,
  views integer DEFAULT 0,
  likes integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create mentorship_programs table
CREATE TABLE IF NOT EXISTS mentorship_programs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  expertise_areas text[] NOT NULL,
  requirements text[],
  duration_weeks integer NOT NULL,
  max_mentees integer NOT NULL,
  current_mentees integer DEFAULT 0,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'full', 'completed', 'cancelled')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create mentorship_applications table
CREATE TABLE IF NOT EXISTS mentorship_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id uuid REFERENCES mentorship_programs ON DELETE CASCADE NOT NULL,
  mentee_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  motivation text NOT NULL,
  goals text[] NOT NULL,
  background text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'completed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(program_id, mentee_id)
);

-- Create webinars table
CREATE TABLE IF NOT EXISTS webinars (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  presenter text NOT NULL,
  scheduled_at timestamptz NOT NULL,
  duration_minutes integer NOT NULL,
  topics text[] NOT NULL,
  max_participants integer,
  current_participants integer DEFAULT 0,
  registration_deadline timestamptz NOT NULL,
  meeting_url text,
  recording_url text,
  status text NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create webinar_registrations table
CREATE TABLE IF NOT EXISTS webinar_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  webinar_id uuid REFERENCES webinars ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  status text NOT NULL DEFAULT 'registered' CHECK (status IN ('registered', 'attended', 'no_show')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(webinar_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE career_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentorship_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentorship_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE webinars ENABLE ROW LEVEL SECURITY;
ALTER TABLE webinar_registrations ENABLE ROW LEVEL SECURITY;

-- Create policies for courses
CREATE POLICY "Anyone can view published courses"
  ON courses FOR SELECT
  USING (status = 'published');

CREATE POLICY "Admins can manage courses"
  ON courses FOR ALL
  TO authenticated
  USING (auth.uid() IN (
    SELECT auth.uid() FROM auth.users WHERE email = 'admin@work4all.com'
  ));

-- Create policies for course_enrollments
CREATE POLICY "Users can view own enrollments"
  ON course_enrollments FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can enroll in courses"
  ON course_enrollments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own enrollments"
  ON course_enrollments FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create policies for career_resources
CREATE POLICY "Anyone can view career resources"
  ON career_resources FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage career resources"
  ON career_resources FOR ALL
  TO authenticated
  USING (auth.uid() IN (
    SELECT auth.uid() FROM auth.users WHERE email = 'admin@work4all.com'
  ));

-- Create policies for mentorship programs
CREATE POLICY "Anyone can view active mentorship programs"
  ON mentorship_programs FOR SELECT
  USING (status = 'active');

CREATE POLICY "Mentors can manage own programs"
  ON mentorship_programs FOR ALL
  TO authenticated
  USING (auth.uid() = mentor_id)
  WITH CHECK (auth.uid() = mentor_id);

-- Create policies for mentorship applications
CREATE POLICY "Users can view own applications"
  ON mentorship_applications FOR SELECT
  TO authenticated
  USING (auth.uid() = mentee_id OR EXISTS (
    SELECT 1 FROM mentorship_programs
    WHERE id = program_id AND mentor_id = auth.uid()
  ));

CREATE POLICY "Users can apply to programs"
  ON mentorship_applications FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = mentee_id);

-- Create policies for webinars
CREATE POLICY "Anyone can view upcoming webinars"
  ON webinars FOR SELECT
  USING (status IN ('upcoming', 'ongoing'));

CREATE POLICY "Admins can manage webinars"
  ON webinars FOR ALL
  TO authenticated
  USING (auth.uid() IN (
    SELECT auth.uid() FROM auth.users WHERE email = 'admin@work4all.com'
  ));

-- Create policies for webinar registrations
CREATE POLICY "Users can view own registrations"
  ON webinar_registrations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can register for webinars"
  ON webinar_registrations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create function to update course progress
CREATE OR REPLACE FUNCTION update_course_progress(
  enrollment_id_param uuid,
  new_progress integer
)
RETURNS void AS $$
BEGIN
  UPDATE course_enrollments
  SET 
    progress = new_progress,
    last_activity_at = now(),
    completed_at = CASE 
      WHEN new_progress = 100 THEN now()
      ELSE completed_at
    END,
    status = CASE
      WHEN new_progress = 100 THEN 'completed'
      WHEN new_progress > 0 THEN 'in_progress'
      ELSE status
    END
  WHERE id = enrollment_id_param
  AND user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to match mentors
CREATE OR REPLACE FUNCTION find_matching_mentors(
  expertise_areas_param text[],
  max_results integer DEFAULT 5
)
RETURNS TABLE (
  mentor_id uuid,
  program_id uuid,
  mentor_name text,
  program_title text,
  matching_areas text[],
  available_spots integer
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    mp.mentor_id,
    mp.id as program_id,
    p.full_name as mentor_name,
    mp.title as program_title,
    mp.expertise_areas as matching_areas,
    (mp.max_mentees - mp.current_mentees) as available_spots
  FROM mentorship_programs mp
  JOIN profiles p ON p.user_id = mp.mentor_id
  WHERE mp.status = 'active'
  AND mp.current_mentees < mp.max_mentees
  AND mp.expertise_areas && expertise_areas_param
  ORDER BY array_length(
    array(SELECT unnest(mp.expertise_areas) INTERSECT SELECT unnest(expertise_areas_param)),
    1
  ) DESC
  LIMIT max_results;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;