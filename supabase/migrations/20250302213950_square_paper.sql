/*
  # Job Post Enhancements

  1. New Fields
    - `benefits` (text): Stores what the job offers to candidates
    - `image_url` (text): Stores the URL to the job/company image
    - `external_url` (text): Stores the complete URL to the external job posting

  2. Purpose
    - The benefits field allows employers to highlight what they offer to candidates
    - The image_url enables visual representation of the company/job
    - The external_url provides a way to link to the complete job posting on the company website
*/

-- Add new fields to job_posts table
ALTER TABLE job_posts ADD COLUMN IF NOT EXISTS benefits text;
ALTER TABLE job_posts ADD COLUMN IF NOT EXISTS image_url text;
ALTER TABLE job_posts ADD COLUMN IF NOT EXISTS external_url text;