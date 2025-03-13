/*
  # Add company profiles and reviews functionality

  1. New Tables
    - `companies`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `description` (text)
      - `logo_url` (text)
      - `website` (text)
      - `industry` (text)
      - `size` (text)
      - `founded_year` (integer)
      - `headquarters` (text)
      - `created_at` (timestamp)
    
    - `company_reviews`
      - `id` (uuid, primary key)
      - `company_id` (uuid, references companies)
      - `user_id` (uuid, references auth.users)
      - `rating` (integer)
      - `title` (text)
      - `pros` (text)
      - `cons` (text)
      - `advice` (text)
      - `is_current_employee` (boolean)
      - `job_title` (text)
      - `employment_status` (text)
      - `created_at` (timestamp)
  
  2. Security
    - Enable RLS on both tables
    - Add policies for viewing and managing companies and reviews
*/

-- Create companies table
CREATE TABLE IF NOT EXISTS companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text NOT NULL,
  logo_url text,
  website text,
  industry text,
  size text,
  founded_year integer,
  headquarters text,
  created_at timestamptz DEFAULT now()
);

-- Create company_reviews table
CREATE TABLE IF NOT EXISTS company_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title text NOT NULL,
  pros text NOT NULL,
  cons text NOT NULL,
  advice text,
  is_current_employee boolean DEFAULT false,
  job_title text NOT NULL,
  employment_status text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(company_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_reviews ENABLE ROW LEVEL SECURITY;

-- Create policies for companies
CREATE POLICY "Anyone can view companies"
  ON companies FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert companies"
  ON companies FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IN (
    SELECT auth.uid() FROM auth.users WHERE email = 'admin@work4all.com'
  ));

CREATE POLICY "Admins can update companies"
  ON companies FOR UPDATE
  TO authenticated
  USING (auth.uid() IN (
    SELECT auth.uid() FROM auth.users WHERE email = 'admin@work4all.com'
  ))
  WITH CHECK (auth.uid() IN (
    SELECT auth.uid() FROM auth.users WHERE email = 'admin@work4all.com'
  ));

-- Create policies for company_reviews
CREATE POLICY "Anyone can view company reviews"
  ON company_reviews FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create reviews"
  ON company_reviews FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews"
  ON company_reviews FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews"
  ON company_reviews FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Insert sample companies
INSERT INTO companies (name, description, industry, size, founded_year, headquarters, website)
VALUES 
  ('TechNova', 'Uma empresa inovadora de tecnologia focada em soluções de software para empresas de todos os tamanhos.', 'Tecnologia', '201-500', 2010, 'Lisboa, Portugal', 'https://technova.example.com'),
  ('MediSaúde', 'Rede de clínicas e hospitais com foco em atendimento humanizado e tecnologia de ponta.', 'Saúde', '1001+', 1995, 'Porto, Portugal', 'https://medisaude.example.com'),
  ('EduFuturo', 'Plataforma educacional que conecta estudantes e professores em um ambiente de aprendizado digital.', 'Educação', '51-200', 2018, 'Braga, Portugal', 'https://edufuturo.example.com'),
  ('FinTech Portugal', 'Empresa de tecnologia financeira que desenvolve soluções inovadoras para o setor bancário.', 'Finanças', '11-50', 2020, 'Lisboa, Portugal', 'https://fintechpt.example.com'),
  ('EcoSustentável', 'Empresa focada em soluções sustentáveis para residências e empresas.', 'Meio Ambiente', '11-50', 2015, 'Faro, Portugal', 'https://ecosustentavel.example.com')
ON CONFLICT (name) DO NOTHING;