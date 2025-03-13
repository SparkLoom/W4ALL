/*
  # Enhance job posts table with new fields

  1. Changes
    - Add `benefits` column to store what the job offers
    - Add `image_url` column to store the job image URL
    - Add `external_url` column for complete job posting links
  2. Security
    - Maintain existing RLS policies
*/

-- Add new fields to job_posts table
ALTER TABLE job_posts ADD COLUMN IF NOT EXISTS benefits text;
ALTER TABLE job_posts ADD COLUMN IF NOT EXISTS image_url text;
ALTER TABLE job_posts ADD COLUMN IF NOT EXISTS external_url text;