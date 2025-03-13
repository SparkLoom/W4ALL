/*
  # Add contact fields to job_posts table

  1. New Fields
    - `contact_email` (text) - Email contact for the job
    - `contact_phone` (text) - Phone contact for the job
    - `application_url` (text) - URL for direct application

  2. Changes
    - Adds new fields to existing job_posts table
*/

-- Add contact fields to job_posts table
ALTER TABLE job_posts ADD COLUMN IF NOT EXISTS contact_email text;
ALTER TABLE job_posts ADD COLUMN IF NOT EXISTS contact_phone text;
ALTER TABLE job_posts ADD COLUMN IF NOT EXISTS application_url text;