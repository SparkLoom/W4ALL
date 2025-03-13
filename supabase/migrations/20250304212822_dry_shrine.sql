-- Create resumes table
CREATE TABLE IF NOT EXISTS resumes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  data jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable Row Level Security
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;

-- Create policies for resumes
CREATE POLICY "Users can view own resumes"
  ON resumes FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own resumes"
  ON resumes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own resumes"
  ON resumes FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_resume_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_resume_updated_at
  BEFORE UPDATE ON resumes
  FOR EACH ROW
  EXECUTE FUNCTION update_resume_updated_at();

-- Create function to validate resume data
CREATE OR REPLACE FUNCTION validate_resume_data()
RETURNS TRIGGER AS $$
BEGIN
  -- Ensure required fields exist
  IF NOT (NEW.data ? 'template' AND 
          NEW.data ? 'industry' AND 
          NEW.data ? 'personalInfo' AND 
          NEW.data ? 'education' AND 
          NEW.data ? 'experience' AND 
          NEW.data ? 'skills') THEN
    RAISE EXCEPTION 'Missing required fields in resume data';
  END IF;

  -- Validate personal info
  IF NOT (NEW.data->'personalInfo' ? 'fullName' AND 
          NEW.data->'personalInfo' ? 'email' AND 
          NEW.data->'personalInfo' ? 'phone') THEN
    RAISE EXCEPTION 'Missing required personal information';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_resume_data_trigger
  BEFORE INSERT OR UPDATE ON resumes
  FOR EACH ROW
  EXECUTE FUNCTION validate_resume_data();