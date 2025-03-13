-- Create skill_assessments table
CREATE TABLE IF NOT EXISTS skill_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  industry text NOT NULL,
  difficulty text NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  time_limit_minutes integer NOT NULL,
  passing_score integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create assessment_questions table
CREATE TABLE IF NOT EXISTS assessment_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id uuid REFERENCES skill_assessments ON DELETE CASCADE NOT NULL,
  question text NOT NULL,
  type text NOT NULL CHECK (type IN ('multiple_choice', 'coding', 'text')),
  options jsonb,
  correct_answer text,
  points integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create user_assessments table
CREATE TABLE IF NOT EXISTS user_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  assessment_id uuid REFERENCES skill_assessments ON DELETE CASCADE NOT NULL,
  score integer NOT NULL,
  passed boolean NOT NULL,
  completed_at timestamptz NOT NULL,
  answers jsonb NOT NULL,
  time_taken_minutes integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, assessment_id)
);

-- Create certifications table
CREATE TABLE IF NOT EXISTS certifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  issuer text NOT NULL,
  issue_date date NOT NULL,
  expiry_date date,
  credential_id text,
  credential_url text,
  verified boolean DEFAULT false,
  verification_method text,
  verification_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create skill_badges table
CREATE TABLE IF NOT EXISTS skill_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  skill text NOT NULL,
  level text NOT NULL CHECK (level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  earned_through text NOT NULL,
  earned_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, skill)
);

-- Enable Row Level Security
ALTER TABLE skill_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_badges ENABLE ROW LEVEL SECURITY;

-- Create policies for skill_assessments
CREATE POLICY "Anyone can view skill assessments"
  ON skill_assessments FOR SELECT
  USING (true);

-- Create policies for assessment_questions
CREATE POLICY "Users can view questions for assessments they're taking"
  ON assessment_questions FOR SELECT
  TO authenticated
  USING (true);

-- Create policies for user_assessments
CREATE POLICY "Users can view own assessment results"
  ON user_assessments FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own assessment results"
  ON user_assessments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create policies for certifications
CREATE POLICY "Users can view own certifications"
  ON certifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own certifications"
  ON certifications FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create policies for skill_badges
CREATE POLICY "Anyone can view skill badges"
  ON skill_badges FOR SELECT
  USING (true);

CREATE POLICY "System can create skill badges"
  ON skill_badges FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Function to award skill badge based on assessment
CREATE OR REPLACE FUNCTION award_skill_badge()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.passed THEN
    INSERT INTO skill_badges (user_id, skill, level, earned_through, earned_at)
    SELECT 
      NEW.user_id,
      sa.industry,
      sa.difficulty,
      'assessment',
      NEW.completed_at
    FROM skill_assessments sa
    WHERE sa.id = NEW.assessment_id
    ON CONFLICT (user_id, skill) 
    DO UPDATE SET 
      level = EXCLUDED.level,
      earned_at = EXCLUDED.earned_at
    WHERE skill_badges.earned_at < EXCLUDED.earned_at;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for awarding badges
CREATE TRIGGER award_skill_badge_on_assessment
  AFTER INSERT ON user_assessments
  FOR EACH ROW
  EXECUTE FUNCTION award_skill_badge();

-- Insert sample skill assessments
INSERT INTO skill_assessments (title, description, industry, difficulty, time_limit_minutes, passing_score)
VALUES 
  ('React Developer Assessment', 'Comprehensive assessment of React development skills', 'web_development', 'intermediate', 60, 70),
  ('Python Programming Basics', 'Basic Python programming concepts and syntax', 'programming', 'beginner', 45, 65),
  ('Data Structures & Algorithms', 'Advanced DSA concepts and problem-solving', 'computer_science', 'advanced', 90, 75),
  ('UI/UX Design Principles', 'Assessment of UI/UX design knowledge and best practices', 'design', 'intermediate', 60, 70),
  ('DevOps Fundamentals', 'Basic DevOps concepts and tools', 'devops', 'beginner', 45, 65)
ON CONFLICT DO NOTHING;